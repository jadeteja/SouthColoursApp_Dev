import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const orderNumber = (params.orderNumber as string) || '#SC123456';
  const orderDate = (params.orderDate as string) || '12 May 2024';
  const orderAmount = (params.orderAmount as string) || '5,697';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Success Mascot Illustration */}
        <View style={styles.illustrationBox}>
          <Text style={{ fontSize: 80 }}>👧🐰🎉</Text>
          <View style={styles.checkCircle}>
            <Text style={{ color: colors.white, fontSize: 24, fontWeight: 'bold' }}>✓</Text>
          </View>
        </View>

        <Text style={styles.heading}>Order Placed Successfully!</Text>
        <Text style={styles.subtext}>
          Thank you for shopping with Southcolours.{'\n'}Your order has been placed and will be processed soon.
        </Text>

        {/* Order Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Order Number</Text>
            <Text style={styles.valueHighlight}>{orderNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order Date</Text>
            <Text style={styles.value}>{orderDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount</Text>
            <Text style={styles.valuePrice}>₹ {orderAmount}</Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.continueBtnText}>Continue Shopping</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewOrdersBtn}
          onPress={() => router.replace('/(tabs)/orders')}
        >
          <Text style={styles.viewOrdersBtnText}>View My Orders</Text>
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
  container: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  checkCircle: {
    position: 'absolute',
    bottom: -10,
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  heading: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
  value: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.primaryText,
  },
  valueHighlight: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  valuePrice: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  continueBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.full,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  continueBtnText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  viewOrdersBtn: {
    width: '100%',
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.lg,
    borderRadius: radii.full,
    alignItems: 'center',
  },
  viewOrdersBtnText: {
    color: colors.primaryDeep,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semiBold,
  },
});
