import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';

export default function CheckoutScreen() {
  const router = useRouter();

  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<'CARD' | 'UPI' | 'NET_BANKING' | 'COD'>('UPI');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    setLoading(true);
    // Simulate real backend checkout initiation and Razorpay order response
    setTimeout(() => {
      setLoading(false);
      // Navigate to order confirmation screen with reference ID
      router.replace({
        pathname: '/order-confirmation',
        params: {
          orderNumber: 'SC123456',
          orderDate: '12 May 2024',
          orderAmount: '5,697',
        },
      });
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 1. Delivery Address Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>1. Delivery Address</Text>
          <TouchableOpacity>
            <Text style={styles.addNewLink}>+ Add New</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Address Card */}
        <TouchableOpacity
          style={[styles.addressCard, selectedAddressId === 1 && styles.addressCardActive]}
          onPress={() => setSelectedAddressId(1)}
        >
          <View style={styles.addressTop}>
            <View style={styles.radioCircle}>
              {selectedAddressId === 1 && <View style={styles.radioInner} />}
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.recipientName}>Priya Sharma</Text>
              <Text style={styles.addressLine}>123, Green Park, Bangalore</Text>
              <Text style={styles.addressLine}>Karnataka - 560001</Text>
              <Text style={styles.phoneText}>9876543210</Text>
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Secondary Address Card */}
        <TouchableOpacity
          style={[styles.addressCard, selectedAddressId === 2 && styles.addressCardActive]}
          onPress={() => setSelectedAddressId(2)}
        >
          <View style={styles.addressTop}>
            <View style={styles.radioCircle}>
              {selectedAddressId === 2 && <View style={styles.radioInner} />}
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.recipientName}>Office</Text>
              <Text style={styles.addressLine}>ABC Tech Park, Whitefield</Text>
              <Text style={styles.addressLine}>Bangalore - 560066</Text>
              <Text style={styles.phoneText}>9123456780</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. Payment Method Section */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>2. Payment Method</Text>

        {[
          { key: 'CARD', label: 'Credit / Debit Card', icon: '💳' },
          { key: 'UPI', label: 'UPI (GPay, PhonePe, Paytm, etc.)', icon: '📱' },
          { key: 'NET_BANKING', label: 'Net Banking', icon: '🏦' },
          { key: 'COD', label: 'Cash on Delivery', icon: '💵' },
        ].map((method) => (
          <TouchableOpacity
            key={method.key}
            style={[styles.paymentOption, selectedPayment === method.key && styles.paymentOptionActive]}
            onPress={() => setSelectedPayment(method.key as any)}
          >
            <View style={styles.radioCircle}>
              {selectedPayment === method.key && <View style={styles.radioInner} />}
            </View>
            <Text style={{ fontSize: 20 }}>{method.icon}</Text>
            <Text style={styles.paymentLabel}>{method.label}</Text>
          </TouchableOpacity>
        ))}

        {/* Order Summary Mini Preview */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Order Summary (3 items)</Text>
          <View style={styles.thumbnailsRow}>
            <View style={styles.miniThumb}><Text style={{ fontSize: 20 }}>👗</Text></View>
            <View style={styles.miniThumb}><Text style={{ fontSize: 20 }}>👧</Text></View>
            <View style={styles.miniThumb}><Text style={{ fontSize: 20 }}>🌸</Text></View>
            <View style={{ flex: 1 }} />
            <Text style={styles.summaryTotal}>₹ 5,697</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Place Order CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.placeOrderBtn}
          activeOpacity={0.9}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.placeOrderText}>Place Order</Text>
          )}
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
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.sm,
  },
  addNewLink: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
  addressCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  addressTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  addressInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: 2,
  },
  addressLine: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    lineHeight: 18,
  },
  phoneText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryText,
    marginTop: 4,
    fontWeight: typography.fontWeights.medium,
  },
  editBtn: {
    padding: spacing.xs,
  },
  editText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.semiBold,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  paymentOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  paymentLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.primaryText,
  },
  summaryBox: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
    marginBottom: spacing.sm,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  miniThumb: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTotal: {
    fontSize: typography.fontSizes.md,
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
  placeOrderBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.full,
    alignItems: 'center',
  },
  placeOrderText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
});
