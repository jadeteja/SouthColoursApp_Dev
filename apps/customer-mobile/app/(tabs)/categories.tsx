import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { API_BASE_URL } from '../../src/config/api';
import { useWishlistStore } from '../../src/stores/wishlistStore';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

// Category specific icon helper
const getCategoryIcon = (categoryName: string): string => {
  const lower = (categoryName || '').toLowerCase();
  if (lower.includes('frock')) return '👗';
  if (lower.includes('crop top')) return '👚';
  if (lower.includes('lehenga')) return '✨';
  if (lower.includes('kurta') || lower.includes('dhoti')) return '🥻';
  if (lower.includes('mother') || lower.includes('daughter')) return '👩‍👧';
  if (lower.includes('brother') || lower.includes('sister')) return '👫';
  if (lower.includes('family')) return '👨‍👩‍👧‍👦';
  if (lower.includes('offer') || lower.includes('sale')) return '🏷️';
  return '👗';
};

interface CategoryTreeItem {
  id: number;
  name: string;
  slug: string;
  subcategories: {
    id: number;
    name: string;
    slug: string;
  }[];
}

interface ProductItem {
  id: number;
  name: string;
  categoryName?: string;
  basePrice: number;
  discountPrice: number;
  averageRating: number;
  reviewCount: number;
  primaryImageUrl?: string;
}

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

export default function ProductListingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string; search?: string }>();
  const { isInWishlist, toggleItem } = useWishlistStore();

  const [categories, setCategories] = useState<CategoryTreeItem[]>([]);
  // null means "All Categories"
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [selectedSubName, setSelectedSubName] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState(params.search || '');
  const [sortBy, setSortBy] = useState('featured');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setCategories(json.data);
      }
    } catch (e) {
      console.warn('Failed to fetch categories:', e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Set categoryId from navigation params if present
  useEffect(() => {
    if (params.categoryId) {
      if (params.categoryId === 'all') {
        setSelectedCatId(null);
      } else {
        const parsed = parseInt(params.categoryId, 10);
        if (!isNaN(parsed)) {
          setSelectedCatId(parsed);
        }
      }
      setSelectedSubName('All');
    }
  }, [params.categoryId]);

  useEffect(() => {
    if (params.search !== undefined) {
      setSearchQuery(params.search);
    }
  }, [params.search]);

  // Current selected Category object (if any)
  const activeCategory = selectedCatId
    ? categories.find((c) => c.id === selectedCatId)
    : null;
  const activeSubcategories = activeCategory?.subcategories || [];

  // 2. Fetch products from backend with search and category filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/products?size=100&sortBy=${sortBy}`;
      if (selectedCatId) {
        url += `&categoryId=${selectedCatId}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data.content)) {
        const mapped: ProductItem[] = json.data.content.map((p: any) => ({
          id: p.id,
          name: p.name,
          categoryName: p.categoryName,
          basePrice: p.basePrice || 0,
          discountPrice: p.discountPrice || p.basePrice || 0,
          averageRating: p.averageRating || 4.8,
          reviewCount: p.reviewCount || 12,
          primaryImageUrl: p.primaryImageUrl || (p.images && p.images[0]?.imageUrl) || undefined,
        }));
        setProducts(mapped);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCatId, searchQuery, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // Filter products by selected subcategory if applicable
  const filteredProducts = products.filter((p) => {
    if (selectedSubName === 'All') return true;
    return p.name.toLowerCase().includes(selectedSubName.toLowerCase());
  });

  // Client-side sort guarantee
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return a.discountPrice - b.discountPrice;
    }
    if (sortBy === 'price_desc') {
      return b.discountPrice - a.discountPrice;
    }
    if (sortBy === 'newest') {
      return b.id - a.id;
    }
    return 0; // featured/default
  });

  const activeSortLabel = SORT_OPTIONS.find((s) => s.value === sortBy)?.label || 'Featured';

  return (
    <View style={styles.safeArea}>
      {/* Top Header with Back, Title, and Search Input */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.backBtn}>
          <Text style={{ fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search dresses, lehengas, sets..."
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={{ fontSize: 13, color: colors.secondaryText }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.iconAction} onPress={() => router.push('/(tabs)/cart')}>
          <Text style={{ fontSize: 20 }}>🛍️</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Parent Categories Bar (All first on the left, then Frocks, Lehenga Blouse, etc. on its right) */}
      <View style={styles.catTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catTabsList}
          keyboardShouldPersistTaps="handled"
        >
          {/* ✨ All Tab */}
          <TouchableOpacity
            style={[styles.catTab, selectedCatId === null && styles.catTabActive]}
            onPress={() => {
              setSelectedCatId(null);
              setSelectedSubName('All');
            }}
          >
            <Text style={[styles.catTabText, selectedCatId === null && styles.catTabTextActive]}>
              ✨ All
            </Text>
          </TouchableOpacity>

          {/* Categories to the right of All: Frocks, Lehenga Blouse, etc. */}
          {categories.map((cat) => {
            const isSelected = cat.id === selectedCatId;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catTab, isSelected && styles.catTabActive]}
                onPress={() => {
                  setSelectedCatId(cat.id);
                  setSelectedSubName('All');
                }}
              >
                <Text style={[styles.catTabText, isSelected && styles.catTabTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Subcategory Circular / Pill Filter Chips (if selected category has subcategories) */}
      {activeSubcategories.length > 0 && (
        <View style={styles.subcatContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subcatScroll}>
            <TouchableOpacity
              style={[styles.subcatChip, selectedSubName === 'All' && styles.subcatChipActive]}
              onPress={() => setSelectedSubName('All')}
            >
              <View style={[styles.subcatCircle, selectedSubName === 'All' && styles.subcatCircleActive]}>
                <Text style={{ fontSize: 18 }}>👗</Text>
              </View>
              <Text style={[styles.subcatText, selectedSubName === 'All' && styles.subcatTextActive]}>
                All
              </Text>
            </TouchableOpacity>

            {activeSubcategories.map((sub) => {
              const isSelected = selectedSubName.toLowerCase() === sub.name.toLowerCase();
              return (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.subcatChip, isSelected && styles.subcatChipActive]}
                  onPress={() => setSelectedSubName(sub.name)}
                >
                  <View style={[styles.subcatCircle, isSelected && styles.subcatCircleActive]}>
                    <Text style={{ fontSize: 18 }}>{getCategoryIcon(sub.name)}</Text>
                  </View>
                  <Text style={[styles.subcatText, isSelected && styles.subcatTextActive]}>
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Sorting Strip */}
      <View style={styles.sortStrip}>
        <Text style={styles.sortCount}>
          {sortedProducts.length} {sortedProducts.length === 1 ? 'Product' : 'Products'}
          {searchQuery ? ` for "${searchQuery}"` : ''}
        </Text>
        <TouchableOpacity style={styles.sortDropdown} onPress={() => setSortModalVisible(true)}>
          <Text style={styles.sortLabel}>Sort: </Text>
          <Text style={styles.sortSelected}>{activeSortLabel} ▼</Text>
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={sortedProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 44, marginBottom: spacing.sm }}>👗</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No products match your search "${searchQuery}".`
                  : `No products currently available in ${activeCategory?.name || 'this category'}.`}
              </Text>
              {searchQuery ? (
                <TouchableOpacity style={styles.clearBtn} onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearBtnText}>Clear Search</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
          renderItem={({ item }) => {
            const displayImg = item.primaryImageUrl || (item.images && item.images[0]?.imageUrl);
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => router.push(`/product/${item.id}`)}
              >
                <View style={styles.thumbnailBox}>
                  {displayImg ? (
                    <Image source={{ uri: displayImg }} style={styles.thumbImg} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: 44 }}>👗</Text>
                  )}
                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleItem({
                        id: item.id,
                        name: item.name,
                        price: item.discountPrice,
                        originalPrice: item.basePrice,
                        imageUrl: displayImg,
                        rating: item.averageRating,
                        reviewCount: item.reviewCount,
                      });
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{isInWishlist(item.id) ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.pricingRow}>
                    <Text style={styles.discountPrice}>₹{item.discountPrice}</Text>
                    {item.basePrice > item.discountPrice && (
                      <Text style={styles.basePrice}>₹{item.basePrice}</Text>
                    )}
                  </View>
                  <Text style={styles.ratingLabel}>⭐ {item.averageRating} ({item.reviewCount})</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Sort By Bottom Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Sort By</Text>
            {SORT_OPTIONS.map((opt) => {
              const isSelected = opt.value === sortBy;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.sortOptionItem, isSelected && styles.sortOptionItemActive]}
                  onPress={() => {
                    setSortBy(opt.value);
                    setSortModalVisible(false);
                  }}
                >
                  <Text style={[styles.sortOptionText, isSelected && styles.sortOptionTextActive]}>
                    {opt.label}
                  </Text>
                  {isSelected && <Text style={{ color: colors.primaryDeep, fontWeight: 'bold' }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: statusBarHeight,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.primaryText,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: spacing.xs,
  },
  iconAction: {
    padding: spacing.xs,
  },
  catTabsWrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  catTabsList: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  catTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  catTabActive: {
    backgroundColor: colors.primarySoft,
  },
  catTabText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    fontWeight: typography.fontWeights.medium,
  },
  catTabTextActive: {
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
  subcatContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  subcatScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  subcatChip: {
    alignItems: 'center',
    width: 65,
  },
  subcatChipActive: {},
  subcatCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  subcatCircleActive: {
    borderWidth: 2,
    borderColor: colors.primaryDeep,
  },
  subcatText: {
    fontSize: 10,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  subcatTextActive: {
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
  sortStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  sortCount: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    fontWeight: typography.fontWeights.medium,
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  sortSelected: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryDeep,
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnailBox: {
    height: 150,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radii.full,
    padding: 4,
  },
  cardDetails: {
    padding: spacing.sm,
  },
  itemName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
    marginBottom: 4,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  discountPrice: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  basePrice: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedText,
    textDecorationLine: 'line-through',
  },
  ratingLabel: {
    fontSize: 10,
    color: colors.secondaryText,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  clearBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  clearBtnText: {
    color: colors.primaryDeep,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  modalHeading: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.md,
  },
  sortOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortOptionItemActive: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
  },
  sortOptionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryText,
  },
  sortOptionTextActive: {
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
});
