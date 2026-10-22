import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function CouponManagementScreen() {
  const router = useRouter();

  const [coupons, setCoupons] = useState([
    { id: 1, code: 'WELCOME10', discount: '10% OFF', minOrder: 999, validTill: '31 May 2024', isActive: true },
    { id: 2, code: 'FLAT300', discount: '₹300 OFF', minOrder: 1999, validTill: '31 May 2024', isActive: true },
    { id: 3, code: 'KIDS20', discount: '20% OFF (Ethnic Wear)', minOrder: 2499, validTill: '30 Apr 2024', isActive: false },
    { id: 4, code: 'FESTIVAL15', discount: '15% OFF', minOrder: 1499, validTill: '30 Jun 2024', isActive: true },
    { id: 5, code: 'FREESHIP', discount: 'Free Shipping', minOrder: 999, validTill: '31 May 2024', isActive: true },
  ]);

  const toggleCoupon = (id: number) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.brandTitle}>Coupons</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => Alert.alert('Add Coupon', 'Create new promotional discount voucher')}
        >
          <Text style={styles.addBtnText}>+ Add Coupon</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={coupons}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.couponCard}>
            <View style={styles.ticketIcon}>
              <Text style={{ fontSize: 24 }}>🎟️</Text>
            </View>
            <View style={styles.infoCol}>
              <View style={styles.codeRow}>
                <Text style={styles.codeText}>{item.code}</Text>
                <View style={[styles.statusTag, { backgroundColor: item.isActive ? colors.successLight : colors.errorLight }]}>
                  <Text style={[styles.statusTagText, { color: item.isActive ? colors.success : colors.error }]}>
                    {item.isActive ? 'Active' : 'Expired'}
                  </Text>
                </View>
              </View>
              <Text style={styles.discountText}>{item.discount}</Text>
              <Text style={styles.minOrderText}>Min. order ₹{item.minOrder}</Text>
              <Text style={styles.validText}>Valid till {item.validTill}</Text>
            </View>
            <View style={styles.actionCol}>
              <Switch
                value={item.isActive}
                onValueChange={() => toggleCoupon(item.id)}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={colors.white}
              />
              <View style={styles.iconsRow}>
                <TouchableOpacity><Text style={{ fontSize: 16 }}>✏️</Text></TouchableOpacity>
                <TouchableOpacity><Text style={{ fontSize: 16 }}>🗑️</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  brandTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  addBtnText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  couponCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  ticketIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  codeText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  statusTag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: typography.fontWeights.bold,
  },
  discountText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
    marginTop: 2,
  },
  minOrderText: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 1,
  },
  validText: {
    fontSize: 10,
    color: colors.mutedText,
    marginTop: 1,
  },
  actionCol: {
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  iconsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
