import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

interface CartDisplayItem {
  id: number;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export default function CartScreen() {
  const router = useRouter();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(true);
  const [discountAmount, setDiscountAmount] = useState(300);

  const [items, setItems] = useState<CartDisplayItem[]>([
    { id: 1, name: 'Pink Lehenga Set', size: '3-4Y', price: 2499, quantity: 1 },
    { id: 2, name: 'Yellow Anarkali', size: '2-3Y', price: 1899, quantity: 1 },
    { id: 3, name: "Boy's Kurta Set", size: '4-5Y', price: 1599, quantity: 1 },
  ]);

  const updateQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const shipping = subtotal > 1500 ? 0 : 99;
  const total = Math.max(0, subtotal - (couponApplied ? discountAmount : 0) + shipping);

  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponApplied(true);
    setDiscountAmount(300);
    Alert.alert('Coupon Applied', `Code ${couponCode.toUpperCase()} applied! Saved ₹300`);
  };

  return (
    <View style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart ({items.length} items)</Text>
        <TouchableOpacity onPress={() => setItems([])}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Items List */}
        {items.map((item) => (
          <View key={item.id} style={styles.cartCard}>
            <View style={styles.thumb}>
              <Text style={{ fontSize: 32 }}>👗</Text>
            </View>
            <View style={styles.itemMeta}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemSize}>Size: {item.size}</Text>
              <Text style={styles.itemPrice}>₹ {item.price}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.trashBtn}>
                <Text style={{ fontSize: 16 }}>🗑️</Text>
              </TouchableOpacity>
              <View style={styles.stepper}>
                <TouchableOpacity onPress={() => updateQty(item.id, -1)} style={styles.stepBtn}>
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQty(item.id, 1)} style={styles.stepBtn}>
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
              placeholder="Enter coupon code"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
              placeholderTextColor={colors.mutedText}
            />
            <TouchableOpacity style={styles.applyBtn} onPress={applyCoupon}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Details Breakdown */}
        <View style={styles.billDetailsCard}>
          <Text style={styles.billHeading}>Price Details</Text>
          <View style={styles.billRow}>
            <Text style={styles.billRowLabel}>Subtotal</Text>
            <Text style={styles.billRowValue}>₹ {subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billRowLabel}>Shipping</Text>
            <Text style={styles.billRowFree}>{shipping === 0 ? '₹ 0 (Free)' : `₹ ${shipping}`}</Text>
          </View>
          {couponApplied && (
            <View style={styles.billRow}>
              <Text style={styles.billRowLabel}>Discount</Text>
              <Text style={styles.billRowDiscount}>− ₹ {discountAmount}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹ {total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Bottom Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkoutBtn}
          activeOpacity={0.9}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
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
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  clearAllText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.medium,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  itemSize: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    marginVertical: 2,
  },
  itemPrice: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  actions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  trashBtn: {
    padding: spacing.xs,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
  },
  stepBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  stepBtnText: {
    fontSize: 14,
    color: colors.primaryText,
  },
  qtyText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    paddingHorizontal: spacing.xs,
  },
  couponSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  couponLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
    marginBottom: spacing.xs,
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
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.sm,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  applyBtnText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  billDetailsCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billHeading: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.md,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  billRowLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
  billRowValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.primaryText,
  },
  billRowFree: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.success,
  },
  billRowDiscount: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  totalValue: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.full,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
});
