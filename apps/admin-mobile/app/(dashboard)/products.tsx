import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { API_BASE_URL } from '../../src/config/api';
import { useAdminAuthStore } from '../../src/stores/adminAuthStore';

interface AdminProductItem {
  id: number;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
  imageUrl?: string;
}

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function AdminProductListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState(params.category || 'All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<AdminProductItem[]>([]);

  useEffect(() => {
    if (params.category) {
      setFilter(params.category);
    }
  }, [params.category]);

  const fetchProducts = async () => {
    try {
      let token = useAdminAuthStore.getState().token;
      const headers: Record<string, string> = {};
      if (token && token !== 'mock_admin_token') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/admin/products?size=100`, { headers });
      const json = await res.json();

      if (json.success && json.data && Array.isArray(json.data.content)) {
        const mapped: AdminProductItem[] = json.data.content.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.categoryName || 'General',
          price: p.discountPrice || p.basePrice || 0,
          isActive: p.isActive !== false,
          imageUrl: p.primaryImageUrl || (p.images && p.images[0]?.imageUrl) || undefined,
        }));

        setProducts(mapped);
      }
    } catch {
      // Keep existing products if network temporarily fails
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const toggleProductActive = async (id: number) => {
    const current = products.find((p) => p.id === id);
    if (!current) return;
    const newStatus = !current.isActive;

    // Optimistically update UI
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: newStatus } : p))
    );

    try {
      let token = useAdminAuthStore.getState().token;
      const headers: Record<string, string> = {};
      if (token && token !== 'mock_admin_token') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch(`${API_BASE_URL}/admin/products/${id}/status?active=${newStatus}`, {
        method: 'PATCH',
        headers,
      });
    } catch {
      // Revert if API fails
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !newStatus } : p))
      );
    }
  };

  const deleteProduct = (id: number, name: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const previousProducts = [...products];
            // Optimistic update
            setProducts((prev) => prev.filter((p) => p.id !== id));

            try {
              let token = useAdminAuthStore.getState().token;
              const headers: Record<string, string> = {};
              if (token && token !== 'mock_admin_token') {
                headers['Authorization'] = `Bearer ${token}`;
              }
              const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
                method: 'DELETE',
                headers,
              });

              if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || 'Failed to delete product');
              }
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not delete product');
              // Revert
              setProducts(previousProducts);
            }
          },
        },
      ]
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchesFilter = filter === 'All' || p.category.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      p.price.toString().includes(searchQuery.trim());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>🌸 Southcolours Admin</Text>
        <TouchableOpacity
          style={styles.addProductBtn}
          onPress={() => router.push('/(dashboard)/add-product')}
        >
          <Text style={styles.addProductText}>+ Add Product</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBarWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products by name, category..."
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterRow}>
        {['All', 'Ethnic Wear', 'Dresses', 'Tops', 'Bottoms'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, filter === cat && styles.filterChipActive]}
            onPress={() => setFilter(cat)}
          >
            <Text style={[styles.filterChipText, filter === cat && styles.filterChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Products FlatList */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading products from store...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchProducts();
              }}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 36, marginBottom: spacing.xs }}>👗</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || filter !== 'All'
                  ? `No products match "${searchQuery || filter}".`
                  : 'Your catalog is empty. Tap "+ Add Product" to add your first product!'}
              </Text>
              {(searchQuery.length > 0 || filter !== 'All') && (
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => {
                    setSearchQuery('');
                    setFilter('All');
                  }}
                >
                  <Text style={styles.resetBtnText}>Reset Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <View key={item.id} style={styles.productRow}>
              <View style={styles.thumbnail}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.thumbImg} />
                ) : (
                  <Text style={{ fontSize: 26 }}>👗</Text>
                )}
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productCat}>{item.category}</Text>
                <Text style={styles.productPrice}>₹ {item.price}</Text>
              </View>
              <View style={styles.actionsCol}>
                <Switch
                  value={item.isActive}
                  onValueChange={() => toggleProductActive(item.id)}
                  trackColor={{ false: colors.border, true: colors.success }}
                  thumbColor={colors.white}
                />
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.push(`/(dashboard)/add-product?id=${item.id}`)}
                  >
                    <Text style={styles.editBtnText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteProduct(item.id, item.name)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    paddingTop: statusBarHeight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  addProductBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  addProductText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.sm,
    color: colors.primaryText,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  clearBtnText: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: typography.fontWeights.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resetBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  resetBtnText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.primarySoft,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
  listContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  productRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
  },
  productName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  productCat: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    marginVertical: 2,
  },
  productPrice: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  actionsCol: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  editBtnText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.medium,
  },
  deleteBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  deleteBtnText: {
    fontSize: typography.fontSizes.xs,
    color: colors.error,
    fontWeight: typography.fontWeights.medium,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    borderRadius: radii.md,
    resizeMode: 'cover',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
});
