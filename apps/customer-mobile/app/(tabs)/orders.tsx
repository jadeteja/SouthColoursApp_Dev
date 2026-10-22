import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function MyOrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All Orders');

  const orders = [
    {
      id: 1,
      orderNumber: '#SC123456',
      date: '12 May 2024',
      status: 'Delivered',
      statusColor: colors.success,
      totalAmount: 4398,
      items: [
        { name: 'Pink Lehenga Set', size: '3-4Y', price: 2499 },
        { name: 'Yellow Anarkali', size: '2-3Y', price: 1899 },
      ],
    },
    {
      id: 2,
      orderNumber: '#SC123321',
      date: '05 May 2024',
      status: 'Shipped',
      statusColor: '#2196F3',
      totalAmount: 1599,
      items: [{ name: "Boy's Kurta Set", size: '4-5Y', price: 1599 }],
    },
  ];

  return (
    <View style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity><Text style={{ fontSize: 18 }}>🔍</Text></TouchableOpacity>
          <TouchableOpacity><Text style={{ fontSize: 18 }}>🛍️</Text></TouchableOpacity>
        </View>
      </View>

      {/* Status Tabs */}
      <View style={styles.tabsRow}>
        {['All Orders', 'Processing', 'Shipped', 'Delivered'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderCardHeader}>
              <View>
                <Text style={styles.orderNum}>{item.orderNumber}</Text>
                <Text style={styles.orderDate}>{item.date}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'Delivered' ? colors.successLight : '#E3F2FD' }]}>
                <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
              </View>
            </View>

            {/* Items */}
            {item.items.map((prod, idx) => (
              <View key={idx} style={styles.productRow}>
                <View style={styles.thumb}><Text style={{ fontSize: 24 }}>👗</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{prod.name} (Size: {prod.size})</Text>
                  <Text style={styles.productPrice}>₹ {prod.price}</Text>
                </View>
              </View>
            ))}

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>₹ {item.totalAmount}</Text>
              </View>
              <TouchableOpacity
                style={styles.detailsBtn}
                onPress={() => router.push(`/order-tracking?orderNumber=${encodeURIComponent(item.orderNumber)}`)}
              >
                <Text style={styles.detailsBtnText}>View Details</Text>
              </TouchableOpacity>
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
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'space-around',
  },
  tabBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primaryDeep,
  },
  tabText: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
  tabTextActive: {
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 80,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderNum: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  orderDate: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryText,
    fontWeight: typography.fontWeights.medium,
  },
  productPrice: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  totalAmount: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  detailsBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  detailsBtnText: {
    color: colors.primaryDeep,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
});
