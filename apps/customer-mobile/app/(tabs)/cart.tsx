import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { useCartStore } from '../../src/stores/cartStore';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = getSubtotal();
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
  const total = Math.max(0, subtotal - (couponApplied ? discountAmount : 0) + shipping);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'SOUTH10' || code === 'FIRST10' || code === 'FESTIVE') {
      const discount = Math.min(300, Math.round(subtotal * 0.1));
      setCouponApplied(true);
      setDiscountAmount(discount > 0 ? discount : 100);
      Alert.alert('Coupon Applied', `Code "${code}" applied successfully! You saved ₹${discount > 0 ? discount : 100}`);
    } else {
      Alert.alert('Invalid Coupon', 'Please enter a valid coupon code (e.g. SOUTH10 or FIRST10).');
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setDiscountAmount(0);
    setCouponCode('');
  };

  return (
    <View style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart ({items.length} {items.length === 1 ? 'item' : 'items'})</Text>
        {items.length > 0 ? (
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 56, marginBottom: spacing.sm }}>🛍️</Text>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven't added any dresses to your bag yet.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push('/(tabs)/categories')}
          >
            <Text style={styles.exploreBtnText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            {/* Items List */}
            {items.map((item) => (
              <View key={item.id} style={styles.cartCard}>
                <TouchableOpacity
                  style={styles.thumb}
                  onPress={() => router.push(`/product/${item.productId}`)}
                  activeOpacity={0.8}
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.thumbImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ fontSize: 32 }}>👗</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.itemMeta}>
                  <TouchableOpacity onPress={() => router.push(`/product/${item.productId}`)}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  </TouchableOpacity>
                  <Text style={styles.itemSize}>Size: {item.size}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.trashBtn}>
                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                  </TouchableOpacity>
                  <View style={styles.stepper}>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.stepBtn}>
                      <Text style={styles.stepBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.stepBtn}>
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {/* Apply Coupon Box */}
            <View style={styles.couponSection}>
              <Text style={styles.couponLabel}>Apply Coupon</Text>
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="e.g. SOUTH10"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                  placeholderTextColor={colors.mutedText}
                />
                {couponApplied ? (
                  <TouchableOpacity style={styles.removeCouponBtn} onPress={removeCoupon}>
                    <Text style={styles.removeCouponText}>Remove</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.applyBtn} onPress={applyCoupon}>
                    <Text style={styles.applyBtnText}>Apply</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Price Details Breakdown */}
            <View style={styles.billDetailsCard}>
              <Text style={styles.billHeading}>Price Details</Text>
              <View style={styles.billRow}>
                <Text style={styles.billRowLabel}>Subtotal</Text>
                <Text style={styles.billRowValue}>₹{subtotal}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billRowLabel}>Shipping</Text>
                <Text style={shipping === 0 ? styles.billRowFree : styles.billRowValue}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </Text>
              </View>
              {couponApplied && (
                <View style={styles.billRow}>
                  <Text style={styles.billRowLabel}>Coupon Discount</Text>
                  <Text style={styles.billRowDiscount}>− ₹{discountAmount}</Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.billRow}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalValue}>₹{total}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Checkout Bottom Action Button */}
          <View style={styles.footer}>
            <View style={styles.footerTotalBox}>
              <Text style={styles.footerTotalLabel}>Total</Text>
              <Text style={styles.footerTotalAmount}>₹{total}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              activeOpacity={0.9}
              onPress={() => router.push('/checkout')}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  clearAllText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.semiBold,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 110,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  thumb: {
    width: 68,
    height: 78,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  itemMeta: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  itemName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
    marginBottom: 2,
  },
  itemSize: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemPrice: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  originalPrice: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedText,
    textDecorationLine: 'line-through',
  },
  actions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
  },
  trashBtn: {
    padding: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: colors.surface,
  },
  stepBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primaryText,
  },
  qtyText: {
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryText,
  },
  couponSection: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  couponLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 40,
    fontSize: typography.fontSizes.sm,
  },
  applyBtn: {
    backgroundColor: colors.primaryDeep,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.xs,
  },
  removeCouponBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeCouponText: {
    color: '#b91c1c',
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.xs,
  },
  billDetailsCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billHeading: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.sm,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  billRowLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  billRowValue: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  billRowFree: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: '#16a34a',
  },
  billRowDiscount: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  totalValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  footerTotalBox: {
    minWidth: 80,
  },
  footerTotalLabel: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  footerTotalAmount: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  checkoutBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radii.full,
  },
  exploreBtnText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.sm,
  },
});
