import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { Category, Product, Banner } from '@southcolours/types';
import { API_BASE_URL } from '../../src/config/api';
import { useWishlistStore } from '../../src/stores/wishlistStore';
import { useCartStore } from '../../src/stores/cartStore';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

// Category specific icon helper
const getCategoryIcon = (categoryName: string): string => {
  const lower = (categoryName || '').toLowerCase();
  if (lower.includes('frock')) return '👗'; // Frocks
  if (lower.includes('crop top')) return '👚'; // Lehenga Crop Top Blouse
  if (lower.includes('lehenga') && lower.includes('blouse')) return '✨'; // Lehenga Blouse
  if (lower.includes('lehenga')) return '🥻'; // Lehenga
  if (lower.includes('kurta') || lower.includes('dhoti')) return '🥻'; // Kurta Dhoti
  if (lower.includes('mother') || lower.includes('daughter')) return '👩‍👧'; // Mother and Daughter Combo
  if (lower.includes('brother') || lower.includes('sister')) return '👫'; // Brother and Sister Combo
  if (lower.includes('family')) return '👨‍👩‍👧‍👦'; // Family Combo
  if (lower.includes('offer') || lower.includes('sale')) return '🏷️'; // Offer Dresses
  if (lower.includes('girl')) return '👧';
  if (lower.includes('boy')) return '👦';
  if (lower.includes('baby') || lower.includes('infant')) return '👶';
  if (lower.includes('ethnic') || lower.includes('traditional')) return '✨';
  if (lower.includes('top') || lower.includes('shirt')) return '👚';
  if (lower.includes('bottom') || lower.includes('pant')) return '👖';
  if (lower.includes('new') || lower.includes('arrival')) return '🌟';
  return '🛍️';
};

export default function HomeScreen() {
  const router = useRouter();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { getTotalItems } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  const fetchHomeFeed = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/home-feed`);
      const json = await res.json();
      if (json.success && json.data) {
        setBanners(json.data.banners || []);
        setCategories(json.data.categories || []);
        setNewArrivals(json.data.newArrivals || []);
      }
    } catch {
      // Fallback sample data matching reference image 2 if backend is starting
      setBanners([
        {
          id: 1,
          title: 'Ethnic Wear for Little Ones',
          imageUrl: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
          targetType: 'CATEGORY',
          displayOrder: 1,
          isActive: true,
        },
        {
          id: 2,
          title: 'Pretty Dresses for Every Occasion',
          imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
          targetType: 'CATEGORY',
          displayOrder: 2,
          isActive: true,
        },
      ]);
      setCategories([
        { id: 11, name: 'Frocks', slug: 'frocks', displayOrder: 1, isActive: true },
        { id: 14, name: 'Lehenga Blouse', slug: 'lehenga-blouse', displayOrder: 2, isActive: true },
        { id: 16, name: 'Lehenga Crop Top Blouse', slug: 'lehenga-crop-top-blouse', displayOrder: 3, isActive: true },
        { id: 17, name: 'Kurta Dhoti', slug: 'kurta-dhoti', displayOrder: 4, isActive: true },
        { id: 9, name: 'Mother and Daughter Combo', slug: 'mother-and-daughter-combo', displayOrder: 5, isActive: true },
        { id: 18, name: 'Brother and Sister Combo', slug: 'brother-and-sister-combo', displayOrder: 6, isActive: true },
        { id: 10, name: 'Family Combo', slug: 'family-combo', displayOrder: 7, isActive: true },
        { id: 19, name: 'Offer Dresses', slug: 'offer-dresses', displayOrder: 8, isActive: true },
      ]);
      setNewArrivals([
        {
          id: 1,
          categoryId: 4,
          name: 'Pink Lehenga Set',
          slug: 'pink-lehenga-set',
          description: 'Beautiful pink lehenga set with intricate embroidery, perfect for weddings and festive occasions.',
          basePrice: 3499,
          discountPrice: 2499,
          discountPercentage: 29,
          averageRating: 4.8,
          reviewCount: 24,
          isActive: true,
          isFeatured: true,
          isNewArrival: true,
          images: [{ id: 1, imageUrl: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=600&q=80', displayOrder: 1, isPrimary: true }],
          variants: [
            { id: 1, productId: 1, sku: 'SC-LHG-PNK-1', size: '3-4Y', colorName: 'Pink', stockQuantity: 20, reservedQuantity: 0, availableQuantity: 20, isActive: true },
          ],
        },
        {
          id: 2,
          categoryId: 4,
          name: 'Yellow Anarkali',
          slug: 'yellow-anarkali',
          description: 'Cheerful yellow flared anarkali gown for girls.',
          basePrice: 2499,
          discountPrice: 1899,
          discountPercentage: 24,
          averageRating: 4.7,
          reviewCount: 36,
          isActive: true,
          isFeatured: true,
          isNewArrival: true,
          images: [{ id: 2, imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80', displayOrder: 1, isPrimary: true }],
          variants: [],
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomeFeed();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeFeed();
  };

  return (
    <View style={styles.safeArea}>
      {/* Sticky Header with Logo, Search, Wishlist & Cart */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.brandLogo}>🌸 Southcolours</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/wishlist')}>
              <Text style={{ fontSize: 20 }}>❤️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/cart')}>
              <Text style={{ fontSize: 20 }}>🛍️</Text>
              {getTotalItems() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/categories')}
        >
          <Text style={styles.searchPlaceholder}>🔍 Search for dresses, ethnic wear, sets...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Promotional Hero Banners Carousel */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.bannerScroll}>
          {banners.map((banner) => (
            <View key={banner.id} style={styles.bannerCard}>
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/(tabs)/categories')}>
                  <Text style={styles.exploreBtnText}>Explore Now →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Circular Categories Grid */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionHeading}>Shop By Category</Text>
          <View style={styles.categoriesGrid}>
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => router.push('/(tabs)/categories?categoryId=all')}
            >
              <View style={[styles.categoryCircle, { backgroundColor: colors.primarySoft }]}>
                <Text style={{ fontSize: 26 }}>✨</Text>
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>All</Text>
            </TouchableOpacity>

            {categories.map((cat) => {
              let catImage = cat.imageUrl;
              if (!catImage) {
                const lower = cat.name.toLowerCase();
                if (lower.includes('lehenga blouse')) {
                  catImage = 'https://southcolours-backend.onrender.com/api/v1/media/625360bf-c8f9-4ed7-be98-33f0409b3ef1.jpg';
                } else if (lower.includes('brother') && lower.includes('sister')) {
                  catImage = 'https://southcolours-backend.onrender.com/api/v1/media/5a6d70af-dc16-46d5-9fd8-aaf380f9503a.jpg';
                }
              }
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryItem}
                  onPress={() => router.push(`/(tabs)/categories?categoryId=${cat.id}`)}
                >
                  <View style={styles.categoryCircle}>
                    {catImage ? (
                      <Image
                        source={{ uri: catImage }}
                        style={styles.categoryImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ fontSize: 28 }}>{getCategoryIcon(cat.name)}</Text>
                    )}
                  </View>
                  <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* New Arrivals Product Grid */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>New Arrivals</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productGrid}>
            {newArrivals.map((product) => {
              const displayImg = product.primaryImageUrl || (product.images && product.images[0]?.imageUrl);
              return (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/product/${product.id}`)}
                >
                  <View style={styles.imagePlaceholder}>
                    {displayImg ? (
                      <Image
                        source={{ uri: displayImg }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ fontSize: 48 }}>👗</Text>
                    )}
                    <TouchableOpacity
                      style={styles.wishlistIcon}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleItem({
                          id: product.id,
                          name: product.name,
                          price: product.discountPrice || product.basePrice,
                          originalPrice: product.basePrice,
                          imageUrl: displayImg,
                          rating: product.averageRating,
                          reviewCount: product.reviewCount,
                        });
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{isInWishlist(product.id) ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle} numberOfLines={1}>{product.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.discountPrice}>₹{product.discountPrice}</Text>
                      {product.basePrice > product.discountPrice && (
                        <Text style={styles.basePrice}>₹{product.basePrice}</Text>
                      )}
                    </View>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingText}>⭐ {product.averageRating} ({product.reviewCount})</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: statusBarHeight,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brandLogo: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBtn: {
    padding: spacing.xs,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
  },
  searchBar: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
  },
  searchPlaceholder: {
    color: colors.secondaryText,
    fontSize: typography.fontSizes.sm,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  bannerScroll: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  bannerCard: {
    width: 330,
    height: 160,
    backgroundColor: colors.primaryLight,
    borderRadius: radii.xl,
    marginRight: spacing.md,
    overflow: 'hidden',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  bannerOverlay: {
    maxWidth: 200,
  },
  bannerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
    marginBottom: spacing.md,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  exploreBtnText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionHeading: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  categoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryText,
    fontWeight: typography.fontWeights.medium,
    textAlign: 'center',
  },
  productsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllText: {
    color: colors.primaryDeep,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 180,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  wishlistIcon: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: spacing.md,
  },
  productTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  discountPrice: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  basePrice: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedText,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
});
