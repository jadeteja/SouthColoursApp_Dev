import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';

const availableSizes = ['1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-8Y'];
const availableColors = [
  { name: 'Pink', hex: '#FF69B4' },
  { name: 'Yellow', hex: '#FFD700' },
  { name: 'Purple', hex: '#9370DB' },
];

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [selectedSize, setSelectedSize] = useState('3-4Y');
  const [selectedColor, setSelectedColor] = useState('Pink');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = () => {
    Alert.alert('Added to Cart', 'Pink Lehenga Set (Size: ' + selectedSize + ') added to your shopping cart.');
  };

  const handleBuyNow = () => {
    router.push('/(tabs)/cart');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setIsWishlisted(!isWishlisted)} style={styles.headerActionBtn}>
            <Text style={{ fontSize: 20 }}>{isWishlisted ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Text style={{ fontSize: 20 }}>↗️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Large Product Gallery Carousel */}
        <View style={styles.imageGallery}>
          <Text style={{ fontSize: 100 }}>👧🌸</Text>
        </View>

        {/* Title, Ratings & Reviews */}
        <View style={styles.detailsCard}>
          <Text style={styles.productTitle}>Pink Lehenga Set</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.reviewsText}>(24 reviews)</Text>
          </View>

          {/* Pricing Strip */}
          <View style={styles.pricingStrip}>
            <Text style={styles.sellingPrice}>₹ 2,499</Text>
            <Text style={styles.originalPrice}>₹ 3,499</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>29% OFF</Text>
            </View>
          </View>

          <Text style={styles.description}>
            Beautiful pink lehenga set with intricate floral embroidery, perfect for weddings, festivals, and special occasions. Breathable, comfortable fabric tailored for your little princess.
          </Text>

          {/* Size Selection */}
          <View style={styles.selectorSection}>
            <View style={styles.selectorHeader}>
              <Text style={styles.selectorTitle}>Size (Age)</Text>
              <TouchableOpacity>
                <Text style={styles.sizeGuideLink}>Size Guide</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chipsRow}>
              {availableSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeChip, selectedSize === size && styles.sizeChipActive]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[styles.sizeChipText, selectedSize === size && styles.sizeChipTextActive]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.selectorSection}>
            <Text style={styles.selectorTitle}>Color</Text>
            <View style={styles.chipsRow}>
              {availableColors.map((col) => (
                <TouchableOpacity
                  key={col.name}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: col.hex },
                    selectedColor === col.name && styles.colorCircleActive,
                  ]}
                  onPress={() => setSelectedColor(col.name)}
                />
              ))}
            </View>
          </View>

          {/* Quantity Stepper */}
          <View style={styles.selectorSection}>
            <Text style={styles.selectorTitle}>Quantity</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Sticky Bar: Add to Cart & Buy Now */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerActionBtn: {
    padding: spacing.xs,
  },
  content: {
    paddingBottom: 100,
  },
  imageGallery: {
    height: 320,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    padding: spacing.xl,
  },
  productTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  ratingStars: {
    fontSize: 14,
  },
  reviewsText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  pricingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sellingPrice: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  originalPrice: {
    fontSize: typography.fontSizes.md,
    color: colors.mutedText,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  discountBadgeText: {
    color: colors.primaryDeep,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  description: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  selectorSection: {
    marginBottom: spacing.lg,
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  selectorTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  sizeGuideLink: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.medium,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sizeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },
  sizeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  sizeChipText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryText,
  },
  sizeChipTextActive: {
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.white,
  },
  colorCircleActive: {
    borderColor: colors.primaryDeep,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  stepBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  stepBtnText: {
    fontSize: 20,
    color: colors.primaryText,
  },
  quantityText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    paddingHorizontal: spacing.md,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    gap: spacing.md,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.lg,
    borderRadius: radii.full,
    alignItems: 'center',
  },
  addToCartText: {
    color: colors.primaryDeep,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.full,
    alignItems: 'center',
  },
  buyNowText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
});
