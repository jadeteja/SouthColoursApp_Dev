import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { API_BASE_URL } from '../../src/config/api';
import { useAdminAuthStore } from '../../src/stores/adminAuthStore';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

interface DashboardMetrics {
  totalOrders: number;
  totalSales: number;
  newCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  salesOverview?: { dateLabel: string; amount: number }[];
  topCategories?: { categoryName: string; percentage: number; color: string }[];
}

export default function AdminReportsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Sales' | 'Orders' | 'Customers' | 'Products'>('Sales');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalOrders: 0,
    totalSales: 0,
    newCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    salesOverview: [],
    topCategories: [],
  });

  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);

  const fetchReportsData = async () => {
    try {
      const token = useAdminAuthStore.getState().token;
      const headers: Record<string, string> = {};
      if (token && token !== 'mock_admin_token') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch overview metrics
      const [dashRes, ordersRes, custRes, prodRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/dashboard`, { headers }),
        fetch(`${API_BASE_URL}/admin/orders`, { headers }),
        fetch(`${API_BASE_URL}/admin/customers`, { headers }),
        fetch(`${API_BASE_URL}/admin/products?size=50`, { headers }),
      ]);

      const [dashJson, ordersJson, custJson, prodJson] = await Promise.all([
        dashRes.json(),
        ordersRes.json(),
        custRes.json(),
        prodRes.json(),
      ]);

      if (dashJson.success && dashJson.data) {
        setMetrics(dashJson.data);
      }
      if (ordersJson.success && Array.isArray(ordersJson.data)) {
        setOrdersList(ordersJson.data);
      }
      if (custJson.success && Array.isArray(custJson.data)) {
        setCustomersList(custJson.data);
      }
      if (prodJson.success && prodJson.data?.content) {
        setProductsList(prodJson.data.content);
      }
    } catch (e) {
      console.warn('Failed to fetch detailed reports data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReportsData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportsData();
  };

  const avgOrderValue =
    metrics.totalOrders > 0
      ? Math.round(Number(metrics.totalSales) / Number(metrics.totalOrders))
      : 0;

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Reports</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['Sales', 'Orders', 'Customers', 'Products'] as const).map((tab) => (
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

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading store analytics...</Text>
          </View>
        ) : (
          <>
            {/* TAB 1: SALES */}
            {activeTab === 'Sales' && (
              <View style={styles.tabContent}>
                <View style={styles.summaryCard}>
                  <Text style={styles.sectionTitle}>Sales Summary</Text>
                  <View style={styles.metricGrid}>
                    <View style={styles.metricBox}>
                      <Text style={{ fontSize: 20 }}>💰</Text>
                      <View>
                        <Text style={styles.metricLabel}>Total Sales</Text>
                        <Text style={styles.metricValue}>
                          ₹ {Number(metrics.totalSales || 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={{ fontSize: 20 }}>🏷️</Text>
                      <View>
                        <Text style={styles.metricLabel}>Avg. Order Value</Text>
                        <Text style={styles.metricValue}>
                          ₹ {avgOrderValue.toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={{ fontSize: 20 }}>🛍️</Text>
                      <View>
                        <Text style={styles.metricLabel}>Total Orders</Text>
                        <Text style={styles.metricValue}>{metrics.totalOrders}</Text>
                      </View>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={{ fontSize: 20 }}>👥</Text>
                      <View>
                        <Text style={styles.metricLabel}>Customers</Text>
                        <Text style={styles.metricValue}>{metrics.newCustomers}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {metrics.salesOverview && metrics.salesOverview.length > 0 ? (
                  <View style={styles.chartCard}>
                    <Text style={styles.sectionTitle}>Sales Trend</Text>
                    <View style={styles.chartPlaceholder}>
                      {metrics.salesOverview.map((item, idx) => (
                        <Text key={idx} style={styles.chartY}>
                          {item.dateLabel}: ₹ {Number(item.amount).toLocaleString('en-IN')}
                        </Text>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyCard}>
                    <Text style={{ fontSize: 32, marginBottom: spacing.xs }}>📊</Text>
                    <Text style={styles.emptyTitle}>No Sales History Yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Sales performance data will appear here automatically when customer purchases take place.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* TAB 2: ORDERS */}
            {activeTab === 'Orders' && (
              <View style={styles.tabContent}>
                <View style={styles.summaryCard}>
                  <Text style={styles.sectionTitle}>Orders Overview</Text>
                  <View style={styles.metricGrid}>
                    <View style={styles.metricBox}>
                      <Text style={{ fontSize: 20 }}>📦</Text>
                      <View>
                        <Text style={styles.metricLabel}>Total Orders</Text>
                        <Text style={styles.metricValue}>{metrics.totalOrders}</Text>
                      </View>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={{ fontSize: 20 }}>⏳</Text>
                      <View>
                        <Text style={styles.metricLabel}>Pending Fulfillment</Text>
                        <Text style={styles.metricValue}>{metrics.pendingOrders || 0}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {ordersList.length > 0 ? (
                  <View style={styles.tableCard}>
                    <Text style={styles.sectionTitle}>Recent Orders Breakdown</Text>
                    {ordersList.map((order, idx) => (
                      <View key={idx} style={styles.orderRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.orderId}>{order.orderNumber || `#SC${order.id}`}</Text>
                          <Text style={styles.orderCust}>{order.customerName || order.customerEmail || 'Customer'}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.orderAmt}>₹ {Number(order.totalAmount || 0).toLocaleString('en-IN')}</Text>
                          <Text style={[styles.orderStat, { color: colors.primary }]}>{order.status}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyCard}>
                    <Text style={{ fontSize: 32, marginBottom: spacing.xs }}>🛍️</Text>
                    <Text style={styles.emptyTitle}>No Orders Yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Customer orders and status breakdown will be listed here.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* TAB 3: CUSTOMERS */}
            {activeTab === 'Customers' && (
              <View style={styles.tabContent}>
                <View style={styles.summaryCard}>
                  <Text style={styles.sectionTitle}>Customer Analytics</Text>
                  <View style={styles.metricGrid}>
                    <View style={styles.metricBox}>
                      <Text style={{ fontSize: 20 }}>👥</Text>
                      <View>
                        <Text style={styles.metricLabel}>Registered Users</Text>
                        <Text style={styles.metricValue}>{metrics.newCustomers}</Text>
                      </View>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={{ fontSize: 20 }}>⭐</Text>
                      <View>
                        <Text style={styles.metricLabel}>Active Shoppers</Text>
                        <Text style={styles.metricValue}>{metrics.totalOrders > 0 ? metrics.newCustomers : 0}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {customersList.length > 0 ? (
                  <View style={styles.tableCard}>
                    <Text style={styles.sectionTitle}>Customer Accounts ({customersList.length})</Text>
                    {customersList.map((cust, idx) => (
                      <View key={idx} style={styles.custRow}>
                        <View style={styles.avatarMini}>
                          <Text style={styles.avatarMiniText}>
                            {(cust.fullName || cust.email || 'U').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.custName}>{cust.fullName || 'User'}</Text>
                          <Text style={styles.custEmail}>{cust.email}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.custDate}>{cust.registeredDate || 'Member'}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyCard}>
                    <Text style={{ fontSize: 32, marginBottom: spacing.xs }}>👥</Text>
                    <Text style={styles.emptyTitle}>No Customers Yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Registered customers will be listed here.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* TAB 4: PRODUCTS */}
            {activeTab === 'Products' && (
              <View style={styles.tabContent}>
                <View style={styles.summaryCard}>
                  <Text style={styles.sectionTitle}>Inventory & Catalog</Text>
                  <View style={styles.metricGrid}>
                    <View style={styles.metricBox}>
                      <Text style={{ fontSize: 20 }}>👗</Text>
                      <View>
                        <Text style={styles.metricLabel}>Live Products</Text>
                        <Text style={styles.metricValue}>{metrics.totalProducts}</Text>
                      </View>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={{ fontSize: 20 }}>🏷️</Text>
                      <View>
                        <Text style={styles.metricLabel}>Categories</Text>
                        <Text style={styles.metricValue}>8</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {productsList.length > 0 ? (
                  <View style={styles.tableCard}>
                    <Text style={styles.sectionTitle}>Catalog Breakdown ({productsList.length})</Text>
                    {productsList.map((prod, idx) => (
                      <View key={idx} style={styles.prodRow}>
                        <View style={styles.prodThumb}>
                          <Text style={{ fontSize: 20 }}>👗</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.prodName}>{prod.name}</Text>
                          <Text style={styles.prodCat}>{prod.categoryName || 'Ethnic Wear'}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.prodPrice}>
                            ₹ {Number(prod.discountPrice || prod.basePrice || 0).toLocaleString('en-IN')}
                          </Text>
                          <Text style={[styles.prodBadge, { color: prod.isActive ? colors.success : colors.secondaryText }]}>
                            {prod.isActive ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyCard}>
                    <Text style={{ fontSize: 32, marginBottom: spacing.xs }}>👗</Text>
                    <Text style={styles.emptyTitle}>No Products Found</Text>
                    <Text style={styles.emptySubtitle}>
                      Add products from the Products tab to see inventory metrics.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
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
  brandTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  refreshBtn: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  refreshBtnText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
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
  content: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  tabContent: {
    gap: spacing.md,
  },
  centerContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.md,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  metricBox: {
    width: '48%',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.secondaryText,
  },
  metricValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginTop: 1,
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartPlaceholder: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  chartY: {
    fontSize: 11,
    color: colors.secondaryText,
    marginVertical: 4,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
    paddingHorizontal: spacing.md,
  },
  tableCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderId: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  orderCust: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },
  orderAmt: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  orderStat: {
    fontSize: 10,
    fontWeight: typography.fontWeights.medium,
    marginTop: 2,
  },
  custRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    fontSize: 12,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  custName: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  custEmail: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 2,
  },
  custDate: {
    fontSize: 10,
    color: colors.mutedText,
  },
  prodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  prodThumb: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodName: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  prodCat: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 2,
  },
  prodPrice: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  prodBadge: {
    fontSize: 10,
    fontWeight: typography.fontWeights.medium,
    marginTop: 2,
  },
});
