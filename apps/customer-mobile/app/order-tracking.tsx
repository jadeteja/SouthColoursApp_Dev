import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { useOrderStore } from '../src/stores/orderStore';

export default function OrderTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawOrderNumber = (params.orderNumber as string) || '#SC123456';
  const orderNumber = rawOrderNumber.startsWith('#') ? rawOrderNumber : `#${rawOrderNumber}`;

  const { getOrderByNumber } = useOrderStore();
  const order = getOrderByNumber(orderNumber);

  // Milestone timeline states
  const isDelivered = order?.status === 'Delivered';
  const isShipped = order?.status === 'Shipped' || isDelivered;
  const isProcessing = true; // Placed and confirmed

  const steps = [
    { label: 'Order Placed', time: order?.date ? `${order.date}, 10:00 AM` : '12 May, 10:00 AM', completed: true, active: false },
    { label: 'Processing', time: order?.date ? `${order.date}, 02:30 PM` : '12 May, 02:30 PM', completed: isProcessing, active: !isShipped },
    { label: 'Shipped', time: isShipped ? 'In Transit' : 'Pending', completed: isShipped, active: isShipped && !isDelivered },
    { label: 'Out for Delivery', time: isDelivered ? 'Completed' : (isShipped ? 'Expected tomorrow' : 'Pending'), completed: isDelivered, active: false },
    { label: 'Delivered', time: isDelivered ? (order?.date || 'Today') : 'Pending', completed: isDelivered, active: false },
  ];

  const handleTrackLive = () => {
    const carrier = order?.carrier || 'Delhivery Express';
    const trk = order?.trackingId || '1234567890';
    Alert.alert(
      'Live Carrier Tracking',
      `Carrier: ${carrier}\nTracking ID: ${trk}\n\nStatus: Package in transit with highest priority.`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Help & Support', onPress: () => router.push('/(tabs)/profile') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Reference Strip */}
        <View style={styles.orderStrip}>
          <Text style={styles.orderLabel}>Tracking ID: <Text style={styles.orderNum}>{orderNumber}</Text></Text>
        </View>

        {/* Vertical Timeline */}
        <View style={styles.timelineCard}>
          {steps.map((step, idx) => (
            <View key={idx} style={styles.timelineRow}>
              {/* Indicator Column */}
              <View style={styles.indicatorCol}>
                <View style={[
                  styles.dot,
                  step.completed && styles.dotCompleted,
                  step.active && styles.dotActive
                ]}>
                  {step.completed && <Text style={styles.checkText}>✓</Text>}
                </View>
                {idx < steps.length - 1 && (
                  <View style={[styles.line, step.completed && styles.lineCompleted]} />
                )}
              </View>

              {/* Text Info */}
              <View style={styles.stepInfo}>
                <Text style={[styles.stepLabel, step.active && styles.stepLabelActive]}>
                  {step.label}
                </Text>
                <Text style={styles.stepTime}>{step.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Courier Details Card */}
        <View style={styles.courierCard}>
          <Text style={styles.cardHeading}>Shipping Details</Text>
          <View style={styles.courierRow}>
            <Text style={{ fontSize: 24 }}>🚚</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.courierName}>{order?.carrier || 'Delhivery Express'}</Text>
              <Text style={styles.trackingNum}>Tracking ID: {order?.trackingId || '1234567890'}</Text>
            </View>
            <TouchableOpacity style={styles.trackLink} onPress={handleTrackLive}>
              <Text style={styles.trackLinkText}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ordered Items Summary */}
        {order && order.items && order.items.length > 0 && (
          <View style={styles.itemsCard}>
            <Text style={styles.cardHeading}>Items in this Order ({order.items.length})</Text>
            {order.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.itemThumb} resizeMode="cover" />
                ) : (
                  <View style={[styles.itemThumb, { alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 20 }}>👗</Text>
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemMeta}>Size: {item.size} {item.quantity ? `• Qty: ${item.quantity}` : ''}</Text>
                  <Text style={styles.itemPrice}>₹ {item.price}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Delivery Address Card */}
        <View style={styles.addressCard}>
          <Text style={styles.cardHeading}>Delivery Address</Text>
          <Text style={styles.addressName}>{order?.deliveryAddress?.name || 'Priya Sharma'}</Text>
          <Text style={styles.addressText}>{order?.deliveryAddress?.street || '123, Green Park, Indiranagar'}</Text>
          <Text style={styles.addressText}>{order?.deliveryAddress?.cityStatePin || 'Bangalore, Karnataka - 560038'}</Text>
          <Text style={styles.addressPhone}>{order?.deliveryAddress?.phone || '+91 98765 43210'}</Text>
        </View>

        {/* Help & Support Button */}
        <TouchableOpacity
          style={styles.supportBtn}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.supportBtnText}>Need Help with this Order? Contact Support</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 40,
  },
  orderStrip: {
    marginBottom: spacing.lg,
  },
  orderLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
  orderNum: {
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  timelineCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 64,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotActive: {
    borderColor: colors.primaryDeep,
    transform: [{ scale: 1.15 }],
  },
  checkText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  lineCompleted: {
    backgroundColor: colors.primary,
  },
  stepInfo: {
    marginLeft: spacing.md,
    justifyContent: 'flex-start',
  },
  stepLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  stepLabelActive: {
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
  stepTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    marginTop: 2,
  },
  courierCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  cardHeading: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.md,
  },
  courierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  courierName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  trackingNum: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  trackLink: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  trackLinkText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
  addressCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  itemsCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: '#f1f5f9',
  },
  itemName: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.primaryText,
  },
  itemMeta: {
    fontSize: 11,
    color: colors.mutedText,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
    marginTop: 1,
  },
  supportBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff0f5',
    marginTop: 4,
    marginBottom: 20,
  },
  supportBtnText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  addressName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: 2,
  },
  addressText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    lineHeight: 18,
  },
  addressPhone: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryText,
    marginTop: 4,
    fontWeight: typography.fontWeights.medium,
  },
});
