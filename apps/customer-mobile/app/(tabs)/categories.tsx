import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { Product } from '@southcolours/types';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

const subcategories = ['Lehenga', 'Anarkali', 'Kurta Sets', 'Gown'];

export default function ProductListingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedSub, setSelectedSub] = useState('Lehenga');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products based on category
    setProducts([
      {
        id: 1,
        categoryId: 4,
        name: 'Pink Lehenga Set',
        slug: 'pink-lehenga-set',
        description: 'Intricate embroidery festive lehenga.',
        basePrice: 3499,
        discountPrice: 2499,
        discountPercentage: 29,
        averageRating: 4.8,
        reviewCount: 24,
        isActive: true,
        isFeatured: true,
        isNewArrival: true,
        images: [{ id: 1, imageUrl: '', displayOrder: 1, isPrimary: true }],
        variants: [],
      },
      {
        id: 2,
        categoryId: 4,
        name: 'Yellow Anarkali',
        slug: 'yellow-anarkali',
        description: 'Bright festive yellow suit set.',
        basePrice: 2499,
        discountPrice: 1899,
        discountPercentage: 24,
        averageRating: 4.9,
        reviewCount: 36,
        isActive: true,
        isFeatured: true,
        isNewArrival: true,
        images: [{ id: 2, imageUrl: '', displayOrder: 1, isPrimary: true }],
        variants: [],
      },
      {
        id: 3,
        categoryId: 4,
        name: 'Purple Lehenga',
        slug: 'purple-lehenga',
        description: 'Traditional purple silk lehenga.',
        basePrice: 2999,
        discountPrice: 2299,
        discountPercentage: 23,
        averageRating: 4.7,
        reviewCount: 18,
        isActive: true,
        isFeatured: false,
        isNewArrival: true,
        images: [{ id: 3, imageUrl: '', displayOrder: 1, isPrimary: true }],
        variants: [],
      },
      {
        id: 4,
        categoryId: 4,
        name: 'Pavadai Set',
        slug: 'pavadai-set',
        description: 'Authentic South Indian pattu pavadai.',
        basePrice: 1999,
        discountPrice: 1599,
        discountPercentage: 20,
        averageRating: 4.9,
        reviewCount: 26,
        isActive: true,
        isFeatured: false,
        isNewArrival: true,
        images: [{ id: 4, imageUrl: '', displayOrder: 1, isPrimary: true }],
        variants: [],
      },
    ]);
    setLoading(false);
  }, []);

  return (
    <View style={styles.safeArea}>
      {/* Top Bar with Back, Title, Search & Wishlist */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.categoryTitle}>Ethnic Wear</Text>
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.iconAction}><Text style={{ fontSize: 18 }}>🔍</Text></TouchableOpacity>
          <TouchableOpacity style={styles.iconAction}><Text style={{ fontSize: 18 }}>🛍️</Text></TouchableOpacity>
        </View>
      </View>

      {/* Subcategory Circular Chips */}
      <View style={styles.subcatContainer}>
        {subcategories.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.subcatChip, selectedSub === item && styles.subcatChipActive]}
            onPress={() => setSelectedSub(item)}
          >
            <View style={[styles.subcatCircle, selectedSub === item && styles.subcatCircleActive]}>
              <Text style={{ fontSize: 22 }}>👗</Text>
            </View>
            <Text style={[styles.subcatText, selectedSub === item && styles.subcatTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sorting Dropdown Strip */}
      <View style={styles.sortStrip}>
        <Text style={styles.sortLabel}>Sort By</Text>
        <TouchableOpacity style={styles.sortDropdown}>
          <Text style={styles.sortSelected}>Featured ▼</Text>
        </TouchableOpacity>
      </View>

      {/* 2-Column Product Grid */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => router.push(`/product/${item.id}`)}
          >
            <View style={styles.thumbnailBox}>
              <Text style={{ fontSize: 50 }}>👧👗</Text>
              <TouchableOpacity style={styles.heartBtn}>
                <Text style={{ fontSize: 14 }}>🤍</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <View style={styles.pricingRow}>
                <Text style={styles.discountPrice}>₹{item.discountPrice}</Text>
                <Text style={styles.basePrice}>₹{item.basePrice}</Text>
              </View>
              <Text style={styles.ratingLabel}>⭐ {item.averageRating} ({item.reviewCount})</Text>
            </View>
          </TouchableOpacity>
        )}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
  },
  categoryTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  rightActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconAction: {
    padding: spacing.xs,
  },
  subcatContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subcatChip: {
    alignItems: 'center',
  },
  subcatChipActive: {},
  subcatCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subcatCircleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  subcatText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
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
    backgroundColor: colors.primarySoft,
  },
  sortLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  sortDropdown: {
    padding: spacing.xs,
  },
  sortSelected: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryDeep,
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: 80,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  thumbnailBox: {
    height: 170,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heartBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 14,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    padding: spacing.sm,
  },
  itemName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
    marginBottom: spacing.xs,
  },
  pricingRow: {
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
  ratingLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
});
