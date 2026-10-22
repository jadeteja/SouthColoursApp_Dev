import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';

export default function OrderTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderNumber = (params.orderNumber as string) || '#SC123456';

  const steps = [
    { label: 'Order Placed', time: '12 May, 10:00 AM', completed: true, active: false },
    { label: 'Processing', time: '12 May, 02:00 PM', completed: true, active: false },
    { label: 'Shipped', time: '13 May, 11:00 AM', completed: true, active: true },
    { label: 'Out for Delivery', time: 'Pending', completed: false, active: false },
    { label: 'Delivered', time: 'Pending', completed: false, active: false },
  ];

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
              <Text style={styles.courierName}>Delhivery Express</Text>
              <Text style={styles.trackingNum}>Tracking ID: 1234567890</Text>
            </View>
            <TouchableOpacity style={styles.trackLink}>
              <Text style={styles.trackLinkText}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Address Card */}
        <View style={styles.addressCard}>
          <Text style={styles.cardHeading}>Delivery Address</Text>
          <Text style={styles.addressName}>Priya Sharma</Text>
          <Text style={styles.addressText}>123, Green Park, Bangalore</Text>
          <Text style={styles.addressText}>Karnataka - 560001</Text>
          <Text style={styles.addressPhone}>9876543210</Text>
        </View>
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
