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
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { API_BASE_URL } from '../../src/config/api';
import { useAdminAuthStore } from '../../src/stores/adminAuthStore';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

interface ReportMetrics {
  totalOrders: number;
  totalSales: number;
  newCustomers: number;
  totalProducts: number;
  salesOverview?: { dateLabel: string; amount: number }[];
  topCategories?: { categoryName: string; percentage: number; color: string }[];
}

export default function AdminReportsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Sales' | 'Orders' | 'Customers' | 'Products'>('Sales');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<ReportMetrics>({
    totalOrders: 0,
    totalSales: 0,
    newCustomers: 0,
    totalProducts: 0,
    salesOverview: [],
    topCategories: [],
  });

  const fetchReportsData = async () => {
    try {
      const token = useAdminAuthStore.getState().token;
      const headers: Record<string, string> = {};
      if (token && token !== 'mock_admin_token') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/admin/dashboard`, { headers });
      const json = await res.json();
      if (json.success && json.data) {
        setMetrics(json.data);
      }
    } catch (e) {
      console.warn('Failed to fetch reports data:', e);
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
            {/* Sales Summary 4-Box Metric Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>
                {activeTab === 'Sales' && 'Sales Summary'}
                {activeTab === 'Orders' && 'Orders Analytics'}
                {activeTab === 'Customers' && 'Customer Base'}
                {activeTab === 'Products' && 'Product Inventory'}
              </Text>
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
                  <Text style={{ fontSize: 20 }}>🛍️</Text>
                  <View>
                    <Text style={styles.metricLabel}>Total Orders</Text>
                    <Text style={styles.metricValue}>{metrics.totalOrders}</Text>
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
                  <Text style={{ fontSize: 20 }}>👥</Text>
                  <View>
                    <Text style={styles.metricLabel}>Customers</Text>
                    <Text style={styles.metricValue}>{metrics.newCustomers}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Sales Trend / Performance Section */}
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
                  Trend analytics will graph here automatically once customer orders are placed.
                </Text>
              </View>
            )}

            {/* Top Categories */}
            {metrics.topCategories && metrics.topCategories.length > 0 ? (
              <View style={styles.topSellingCard}>
                <Text style={styles.sectionTitle}>Category Revenue Share</Text>
                {metrics.topCategories.map((cat, idx) => (
                  <View key={idx} style={styles.catRow}>
                    <Text style={styles.catName}>{cat.categoryName}</Text>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${cat.percentage}%`, backgroundColor: cat.color || colors.primary },
                        ]}
                      />
                    </View>
                    <Text style={styles.catPct}>{cat.percentage}%</Text>
                  </View>
                ))}
              </View>
            ) : null}
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
    gap: spacing.md,
    paddingBottom: 40,
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
  topSellingCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  catName: {
    width: 100,
    fontSize: typography.fontSizes.xs,
    color: colors.primaryText,
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.full,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  catPct: {
    width: 35,
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    textAlign: 'right',
  },
});
