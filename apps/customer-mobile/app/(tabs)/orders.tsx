import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { useOrderStore, CustomerOrder } from '../../src/stores/orderStore';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function MyOrdersScreen() {
  const router = useRouter();
  const { orders } = useOrderStore();
  const [activeTab, setActiveTab] = useState<'All Orders' | 'Processing' | 'Shipped' | 'Delivered'>('All Orders');

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'All Orders') return true;
    return o.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <View style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
            <Text style={{ fontSize: 18 }}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/cart')}>
            <Text style={{ fontSize: 18 }}>🛍️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Tabs */}
      <View style={styles.tabsRow}>
        {(['All Orders', 'Processing', 'Shipped', 'Delivered'] as const).map((tab) => (
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
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🛍️</Text>
            <Text style={styles.emptyTitle}>
              {activeTab === 'All Orders' ? 'No orders placed yet' : `No ${activeTab.toLowerCase()} orders`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'All Orders'
                ? "You haven't placed any orders yet. Discover our trendy collection of kids dresses!"
                : `There are currently no orders under the ${activeTab.toLowerCase()} status.`}
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.browseBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderCardHeader}>
              <View>
                <Text style={styles.orderNum}>{item.orderNumber}</Text>
                <Text style={styles.orderDate}>{item.date}</Text>
              </View>
              <View style={[styles.statusBadge, {
                backgroundColor: item.status === 'Delivered'
                  ? '#ecfdf5'
                  : item.status === 'Shipped'
                  ? '#eff6ff'
                  : '#fffbeb',
              }]}>
                <Text style={[styles.statusText, {
                  color: item.status === 'Delivered'
                    ? '#059669'
                    : item.status === 'Shipped'
                    ? '#2563eb'
                    : '#d97706',
                }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            {/* Items */}
            {item.items.map((prod, idx) => (
              <View key={idx} style={styles.productRow}>
                {prod.imageUrl ? (
                  <Image
                    source={{ uri: prod.imageUrl }}
                    style={styles.thumbImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.thumb}>
                    <Text style={{ fontSize: 24 }}>👗</Text>
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {prod.name}
                  </Text>
                  <Text style={styles.productVariant}>Size: {prod.size} {prod.quantity ? `• Qty: ${prod.quantity}` : ''}</Text>
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
                activeOpacity={0.8}
                onPress={() => {
                  const num = item.orderNumber.replace('#', '');
                  router.push(`/order-tracking?orderNumber=${encodeURIComponent(num)}`);
                }}
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
  productVariant: {
    fontSize: 11,
    color: colors.mutedText,
    marginTop: 2,
    marginBottom: 2,
  },
  thumbImage: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: '#f1f5f9',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  browseBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  browseBtnText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.xs,
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
