import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';

interface AdminProductItem {
  id: number;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
}

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function AdminProductListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [products, setProducts] = useState<AdminProductItem[]>([
    { id: 1, name: 'Pink Lehenga Set', category: 'Ethnic Wear', price: 2499, isActive: true },
    { id: 2, name: 'Yellow Anarkali', category: 'Ethnic Wear', price: 1899, isActive: true },
    { id: 3, name: "Boy's Kurta Set", category: 'Ethnic Wear', price: 1599, isActive: true },
    { id: 4, name: 'Floral Dress', category: 'Dresses', price: 1299, isActive: false },
    { id: 5, name: 'Baby Frock', category: 'Dresses', price: 999, isActive: true },
    { id: 6, name: 'Embroidered Crop Top', category: 'Tops', price: 799, isActive: true },
    { id: 7, name: 'Silk Palazzo Pants', category: 'Bottoms', price: 1199, isActive: true },
    { id: 8, name: 'Cotton Peplum Top', category: 'Tops', price: 649, isActive: true },
    { id: 9, name: 'Dhoti Pants Set', category: 'Bottoms', price: 1399, isActive: true },
  ]);

  const toggleProductActive = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
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
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 36, marginBottom: spacing.xs }}>🔍</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search query "{searchQuery}" or category filter "{filter}"
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
              <Text style={{ fontSize: 26 }}>👗</Text>
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
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => router.push(`/(dashboard)/add-product?id=${item.id}`)}
              >
                <Text style={styles.editBtnText}>✏️ Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
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
  editBtn: {
    paddingVertical: 2,
  },
  editBtnText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.medium,
  },
});
