import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { API_BASE_URL } from '../../src/config/api';
import { useAdminAuthStore } from '../../src/stores/adminAuthStore';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

interface AdminOrderItem {
  id: number;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  items?: Array<{
    id: number;
    productName: string;
    imageUrl?: string;
  }>;
}

export default function AdminOrdersListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);

  const fetchOrders = async () => {
    try {
      const token = useAdminAuthStore.getState().token;
      const headers: Record<string, string> = {};
      if (token && token !== 'mock_admin_token') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/admin/orders`, { headers });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      }
    } catch (e) {
      console.warn('Failed to fetch admin orders:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return colors.success;
      case 'SHIPPED':
        return '#2196F3';
      case 'PROCESSING':
        return colors.warning;
      case 'PENDING':
        return '#FFA726';
      case 'CANCELLED':
        return colors.error;
      default:
        return colors.secondaryText;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab =
      activeTab === 'All' || o.status?.toUpperCase() === activeTab.toUpperCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
      (o.totalAmount && o.totalAmount.toString().includes(searchQuery.trim()));
    return matchesTab && matchesSearch;
  });

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Orders ({filteredOrders.length})</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders by customer, #ID, amount..."
          placeholderTextColor={colors.mutedText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          autoCapitalize="none"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map((tab) => (
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

      {/* Order List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading orders from database...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 40, marginBottom: spacing.sm }}>🛍️</Text>
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || activeTab !== 'All'
                  ? 'No orders match your search or filter.'
                  : 'Customer orders will appear here in real time once placed.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const firstItemImage = item.items?.find((i) => i.imageUrl)?.imageUrl;

            return (
              <TouchableOpacity
                style={styles.orderCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/(dashboard)/order-details?id=${item.id}`)}
              >
                <View style={styles.thumb}>
                  {firstItemImage ? (
                    <Image source={{ uri: firstItemImage }} style={styles.thumbImg} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: 26 }}>👗</Text>
                  )}
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.orderNum}>{item.orderNumber || `#SC${item.id}`}</Text>
                  <Text style={styles.orderDate}>{item.createdAt || 'Recent'}</Text>
                  <Text style={styles.customerName}>
                    {item.customerName || item.customerEmail || 'Customer'}
                  </Text>
                  <Text style={styles.amount}>₹ {Number(item.totalAmount || 0).toLocaleString('en-IN')}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status || 'PENDING'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
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
  brandTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  refreshBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
  },
  refreshBtnText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  searchSection: {
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  searchInput: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    fontSize: typography.fontSizes.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    borderRadius: radii.md,
  },
  infoCol: {
    flex: 1,
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
  customerName: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryText,
    marginTop: 2,
  },
  amount: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
    marginTop: 2,
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
});
