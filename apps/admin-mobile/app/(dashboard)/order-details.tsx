import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function AdminOrderDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState('Delivered');

  const orderedItems = [
    { name: 'Pink Lehenga Set', size: '3-4Y', price: 2499, qty: 1 },
    { name: 'Yellow Anarkali', size: '2-3Y', price: 1899, qty: 1 },
    { name: "Boy's Kurta Set", size: '4-5Y', price: 1599, qty: 1 },
  ];

  const handleUpdateStatus = () => {
    Alert.alert('Update Fulfillment Status', 'Select new order state:', [
      { text: 'Processing', onPress: () => setStatus('Processing') },
      { text: 'Shipped', onPress: () => setStatus('Shipped') },
      { text: 'Delivered', onPress: () => setStatus('Delivered') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleGenerateInvoice = () => {
    Alert.alert('Invoice Generated', 'Invoice PDF #INV-SC123456 has been generated and queued for download.');
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Header Card */}
        <View style={styles.topCard}>
          <View style={styles.orderTopRow}>
            <View>
              <Text style={styles.orderNumber}>Order #SC123456</Text>
              <Text style={styles.orderDate}>12 May 2024, 10:00 AM</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Customer Details</Text>
          <View style={styles.customerRow}>
            <View style={styles.avatarCircle}><Text style={{ color: colors.white, fontWeight: 'bold' }}>P</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>Priya Sharma</Text>
              <Text style={styles.customerEmail}>priya@gmail.com</Text>
              <Text style={styles.customerPhone}>+91 9876543210</Text>
            </View>
            <TouchableOpacity><Text style={styles.viewAddressText}>View Address</Text></TouchableOpacity>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Items ({orderedItems.length})</Text>
          {orderedItems.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemThumb}><Text style={{ fontSize: 24 }}>👗</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSub}>Size: {item.size}</Text>
                <Text style={styles.itemSub}>₹ {item.price} × {item.qty}</Text>
              </View>
              <Text style={styles.itemTotal}>₹ {item.price * item.qty}</Text>
            </View>
          ))}
        </View>

        {/* Financial Summary */}
        <View style={styles.sectionCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹ 5,997</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={styles.discountValue}>− ₹ 300</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.shippingValue}>₹ 0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹ 5,697</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.updateStatusBtn} onPress={handleUpdateStatus}>
            <Text style={styles.updateStatusText}>Update Status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.invoiceBtn} onPress={handleGenerateInvoice}>
            <Text style={styles.invoiceText}>Generate Invoice</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 40,
  },
  topCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  orderDate: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.success,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeading: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.md,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  customerEmail: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  customerPhone: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  viewAddressText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.semiBold,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  itemSub: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  itemTotal: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
  summaryValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.primaryText,
  },
  discountValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.success,
  },
  shippingValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  totalValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  updateStatusBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  updateStatusText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  invoiceBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  invoiceText: {
    color: colors.primaryText,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
  },
});
