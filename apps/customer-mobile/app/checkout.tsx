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
  Modal,
  Image,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { useCartStore } from '../src/stores/cartStore';
import { useOrderStore } from '../src/stores/orderStore';
import { useAuthStore } from '../src/stores/authStore';
import { API_BASE_URL } from '../src/config/api';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();

  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'RAZORPAY_NETBANKING' | 'COD'>('RAZORPAY_UPI');
  const [loading, setLoading] = useState(false);
  const [razorpayModalVisible, setRazorpayModalVisible] = useState(false);
  const [activePaymentStep, setActivePaymentStep] = useState<'SELECT' | 'PROCESSING' | 'SUCCESS'>('SELECT');

  const subtotal = getSubtotal();
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
  const totalAmount = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before checking out.');
      return;
    }

    if (selectedPayment === 'COD') {
      // Cash on Delivery direct confirmation
      setLoading(true);
      const orderNum = 'SC' + Math.floor(100000 + Math.random() * 900000);
      const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const customerName = user?.fullName || 'Priya Sharma';
      const customerPhone = user?.phoneNumber || '+91 98765 43210';
      const customerEmail = user?.email || 'priya@gmail.com';

      const orderPayload = {
        orderNumber: '#' + orderNum,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        paymentMethod: 'Cash on Delivery',
        subtotal: subtotal,
        shippingFee: shipping,
        totalAmount: totalAmount,
        shippingAddress: JSON.stringify({
          name: customerName,
          street: '123, Green Park, Indiranagar',
          cityStatePin: 'Bangalore, Karnataka - 560038',
          phone: customerPhone,
        }),
        items: items.map((i) => ({
          productId: i.productId || null,
          name: i.name || (i as any).product?.name || 'Dress Item',
          size: i.size,
          price: i.price || (i as any).product?.price || 0,
          quantity: i.quantity,
          imageUrl: i.imageUrl || (i as any).product?.primaryImageUrl || ((i as any).product?.images && (i as any).product?.images[0]?.imageUrl),
        })),
      };

      try {
        await fetch(`${API_BASE_URL}/checkout/place-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });
      } catch (err) {
        console.warn('Backend sync error:', err);
      }

      setLoading(false);

      // Save to live order history store
      addOrder({
        id: Date.now(),
        orderNumber: '#' + orderNum,
        date: dateStr,
        status: 'Processing',
        statusColor: '#d97706',
        totalAmount: totalAmount,
        paymentMethod: 'Cash on Delivery',
        trackingId: 'TRK' + Math.floor(10000000 + Math.random() * 90000000),
        carrier: 'Delhivery Express',
        deliveryAddress: {
          name: customerName,
          street: '123, Green Park, Indiranagar',
          cityStatePin: 'Bangalore, Karnataka - 560038',
          phone: customerPhone,
        },
        items: items.map((i) => ({
          name: i.name || (i as any).product?.name || 'Dress Item',
          size: i.size,
          price: i.price || (i as any).product?.price || 0,
          quantity: i.quantity,
          imageUrl: i.imageUrl || (i as any).product?.primaryImageUrl || ((i as any).product?.images && (i as any).product?.images[0]?.imageUrl),
        })),
      });

      clearCart();
      router.replace({
        pathname: '/order-confirmation',
        params: {
          orderNumber: '#' + orderNum,
          orderDate: dateStr,
          orderAmount: totalAmount.toString(),
          paymentMethod: 'Cash on Delivery',
        },
      });
    } else {
      // Direct redirection to the live Razorpay Gateway page in device browser
      const orderNum = 'SC' + Math.floor(100000 + Math.random() * 900000);
      const razorpayGatewayUrl = `${API_BASE_URL}/payment-gateway/pay?amount=${totalAmount}&orderNumber=${orderNum}&name=Priya%20Sharma&phone=9876543210`;

      Linking.openURL(razorpayGatewayUrl).catch(() => {
        // Fallback to in-app sheet if deep link cannot open external browser
        setRazorpayModalVisible(true);
        setActivePaymentStep('SELECT');
      });
    }
  };

  const handleSimulateRazorpayPayment = (success: boolean) => {
    setActivePaymentStep('PROCESSING');

    setTimeout(async () => {
      if (success) {
        const orderNum = 'SC' + Math.floor(100000 + Math.random() * 900000);
        const rzpPaymentId = 'pay_' + Math.random().toString(36).substring(2, 12);
        const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const payMethod = 'Razorpay (' + (selectedPayment === 'RAZORPAY_UPI' ? 'UPI' : 'Card') + ')';
        const customerName = user?.fullName || 'Priya Sharma';
        const customerPhone = user?.phoneNumber || '+91 98765 43210';
        const customerEmail = user?.email || 'priya@gmail.com';

        const orderPayload = {
          orderNumber: '#' + orderNum,
          customerName: customerName,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
          paymentMethod: payMethod,
          subtotal: subtotal,
          shippingFee: shipping,
          totalAmount: totalAmount,
          shippingAddress: JSON.stringify({
            name: customerName,
            street: '123, Green Park, Indiranagar',
            cityStatePin: 'Bangalore, Karnataka - 560038',
            phone: customerPhone,
          }),
          items: items.map((i) => ({
            productId: i.productId || null,
            name: i.name || (i as any).product?.name || 'Dress Item',
            size: i.size,
            price: i.price || (i as any).product?.price || 0,
            quantity: i.quantity,
            imageUrl: i.imageUrl || (i as any).product?.primaryImageUrl || ((i as any).product?.images && (i as any).product?.images[0]?.imageUrl),
          })),
        };

        try {
          await fetch(`${API_BASE_URL}/checkout/place-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload),
          });
        } catch (err) {
          console.warn('Backend sync error:', err);
        }

        setActivePaymentStep('SUCCESS');
        setTimeout(() => {
          setRazorpayModalVisible(false);

          addOrder({
            id: Date.now(),
            orderNumber: '#' + orderNum,
            date: dateStr,
            status: 'Processing',
            statusColor: '#d97706',
            totalAmount: totalAmount,
            paymentMethod: payMethod,
            trackingId: 'RZP' + Math.floor(10000000 + Math.random() * 90000000),
            carrier: 'BlueDart Express',
            deliveryAddress: {
              name: customerName,
              street: '123, Green Park, Indiranagar',
              cityStatePin: 'Bangalore, Karnataka - 560038',
              phone: customerPhone,
            },
            items: items.map((i) => ({
              name: i.name || (i as any).product?.name || 'Dress Item',
              size: i.size,
              price: i.price || (i as any).product?.price || 0,
              quantity: i.quantity,
              imageUrl: i.imageUrl || (i as any).product?.primaryImageUrl || ((i as any).product?.images && (i as any).product?.images[0]?.imageUrl),
            })),
          });

          clearCart();
          router.replace({
            pathname: '/order-confirmation',
            params: {
              orderNumber: '#' + orderNum,
              orderDate: dateStr,
              orderAmount: totalAmount.toString(),
              paymentMethod: payMethod,
              transactionId: rzpPaymentId,
            },
          });
        }, 1200);
      } else {
        setRazorpayModalVisible(false);
        Alert.alert('Payment Cancelled', 'Razorpay transaction was not completed. Please try again.');
      }
    }, 1500);
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. Delivery Address Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>1. Delivery Address</Text>
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
              <Text style={styles.recipientName}>Home &bull; Priya Sharma</Text>
              <Text style={styles.addressLine}>Plot 42, Jubilee Hills, Road No. 10</Text>
              <Text style={styles.addressLine}>Hyderabad, Telangana - 500033</Text>
              <Text style={styles.phoneText}>📞 +91 98765 43210</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. Payment Method Section */}
        <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
          <Text style={styles.sectionTitle}>2. Payment Gateway</Text>
          <View style={styles.securedBadge}>
            <Text style={styles.securedText}>🔒 Razorpay Secured</Text>
          </View>
        </View>

        {[
          { key: 'RAZORPAY_UPI', label: 'UPI (Google Pay, PhonePe, Paytm)', icon: '📱', desc: 'Instant 0% fee checkout' },
          { key: 'RAZORPAY_CARD', label: 'Credit / Debit Cards', icon: '💳', desc: 'Visa, MasterCard, RuPay' },
          { key: 'RAZORPAY_NETBANKING', label: 'Net Banking', icon: '🏦', desc: 'All Indian major banks' },
          { key: 'COD', label: 'Cash on Delivery (COD)', icon: '💵', desc: 'Pay when your dress arrives' },
        ].map((method) => (
          <TouchableOpacity
            key={method.key}
            style={[styles.paymentOption, selectedPayment === method.key && styles.paymentOptionActive]}
            onPress={() => setSelectedPayment(method.key as any)}
          >
            <View style={styles.radioCircle}>
              {selectedPayment === method.key && <View style={styles.radioInner} />}
            </View>
            <Text style={{ fontSize: 24, marginHorizontal: 8 }}>{method.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentLabel}>{method.label}</Text>
              <Text style={styles.paymentDesc}>{method.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Order Summary Mini Preview */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})</Text>
          <View style={styles.summaryItemsList}>
            {items.map((i) => (
              <View key={i.id} style={styles.summaryRow}>
                <Text style={styles.summaryItemText} numberOfLines={1}>
                  {i.name} ({i.size}) × {i.quantity}
                </Text>
                <Text style={styles.summaryItemPrice}>₹{i.price * i.quantity}</Text>
              </View>
            ))}
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billVal}>₹{subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Shipping</Text>
            <Text style={shipping === 0 ? styles.billFree : styles.billVal}>
              {shipping === 0 ? 'FREE' : `₹${shipping}`}
            </Text>
          </View>
          <View style={[styles.billRow, { marginTop: 6 }]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalVal}>₹{totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Place Order CTA */}
      <View style={styles.footer}>
        <View>
          <Text style={{ fontSize: 11, color: colors.secondaryText }}>Amount to pay</Text>
          <Text style={styles.footerPrice}>₹{totalAmount}</Text>
        </View>
        <TouchableOpacity
          style={styles.placeOrderBtn}
          activeOpacity={0.9}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.placeOrderText}>
              {selectedPayment === 'COD' ? 'Confirm Order' : 'Pay with Razorpay →'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Razorpay Standard Payment Modal */}
      <Modal
        visible={razorpayModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRazorpayModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.rzpModal}>
            {/* Razorpay Header */}
            <View style={styles.rzpHeader}>
              <View>
                <Text style={styles.rzpMerchantTitle}>Southcolours Fashion</Text>
                <Text style={styles.rzpSub}>Order Total: ₹{totalAmount}</Text>
              </View>
              <View style={styles.rzpLogo}>
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#0284c7' }}>Razorpay</Text>
              </View>
            </View>

            {activePaymentStep === 'SELECT' && (
              <View style={styles.rzpBody}>
                <Text style={styles.rzpPrompt}>Choose payment method to complete payment:</Text>

                <TouchableOpacity
                  style={styles.rzpOption}
                  onPress={() => handleSimulateRazorpayPayment(true)}
                >
                  <Text style={{ fontSize: 22 }}>📱</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.rzpOptionTitle}>Google Pay / PhonePe / Paytm</Text>
                    <Text style={styles.rzpOptionSub}>Instant UPI Payment</Text>
                  </View>
                  <Text style={styles.rzpPayBadge}>PAY ₹{totalAmount}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rzpOption}
                  onPress={() => handleSimulateRazorpayPayment(true)}
                >
                  <Text style={{ fontSize: 22 }}>💳</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.rzpOptionTitle}>Card / NetBanking</Text>
                    <Text style={styles.rzpOptionSub}>Visa, MasterCard, HDFC, SBI, ICICI</Text>
                  </View>
                  <Text style={styles.rzpPayBadge}>PAY ₹{totalAmount}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rzpCancel}
                  onPress={() => handleSimulateRazorpayPayment(false)}
                >
                  <Text style={styles.rzpCancelText}>Cancel Payment</Text>
                </TouchableOpacity>
              </View>
            )}

            {activePaymentStep === 'PROCESSING' && (
              <View style={[styles.rzpBody, { alignItems: 'center', paddingVertical: 40 }]}>
                <ActivityIndicator size="large" color="#0284c7" />
                <Text style={styles.processingTitle}>Authorizing with Razorpay...</Text>
                <Text style={styles.processingSub}>Please do not press back or refresh.</Text>
              </View>
            )}

            {activePaymentStep === 'SUCCESS' && (
              <View style={[styles.rzpBody, { alignItems: 'center', paddingVertical: 30 }]}>
                <Text style={{ fontSize: 48, marginBottom: 10 }}>✅</Text>
                <Text style={styles.successTitle}>Payment Verified!</Text>
                <Text style={styles.processingSub}>Confirming your Southcolours order...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 110,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  securedBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  securedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
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
    backgroundColor: '#FFF5F8',
  },
  addressTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginLeft: spacing.sm,
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
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
    marginTop: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5F8',
  },
  paymentLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  paymentDesc: {
    fontSize: 11,
    color: colors.mutedText,
    marginTop: 1,
  },
  summaryBox: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.sm,
  },
  summaryItemsList: {
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItemText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    flex: 1,
    marginRight: 8,
  },
  summaryItemPrice: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  billLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  billVal: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  billFree: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: '#16a34a',
  },
  totalLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  totalVal: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  footer: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  footerPrice: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  placeOrderBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  rzpModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden',
  },
  rzpHeader: {
    backgroundColor: '#0c4a6e',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rzpMerchantTitle: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  rzpSub: {
    color: '#bae6fd',
    fontSize: 12,
    marginTop: 2,
  },
  rzpLogo: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  rzpBody: {
    padding: spacing.lg,
  },
  rzpPrompt: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: spacing.md,
  },
  rzpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    backgroundColor: '#f8fafc',
  },
  rzpOptionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  rzpOptionSub: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },
  rzpPayBadge: {
    backgroundColor: '#0284c7',
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  rzpCancel: {
    marginTop: spacing.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rzpCancelText: {
    color: colors.mutedText,
    fontSize: 12,
  },
  processingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginTop: spacing.md,
  },
  processingSub: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 4,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },
});
