import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { API_BASE_URL } from '../../src/config/api';
import { useAdminAuthStore } from '../../src/stores/adminAuthStore';

const screenWidth = Dimensions.get('window').width;
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

export default function AdminDashboardScreen() {
  const router = useRouter();
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

  const fetchDashboardData = async () => {
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
      console.warn('Failed to fetch dashboard metrics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <View style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>🌸 Southcolours</Text>
          <Text style={styles.adminPanelText}>Admin Panel</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(dashboard)/orders')}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/(dashboard)/settings')}>
            <Text style={{ fontSize: 20 }}>👸</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Title */}
        <View style={styles.dashboardTitleRow}>
          <Text style={styles.dashboardHeading}>Dashboard</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading live store metrics...</Text>
          </View>
        ) : (
          <>
            {/* 2x2 Metric KPI Grid */}
            <View style={styles.kpiGrid}>
              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.8}
                onPress={() => router.push('/(dashboard)/orders')}
              >
                <Text style={{ fontSize: 24 }}>🛍️</Text>
                <View>
                  <Text style={styles.kpiLabel}>Total Orders</Text>
                  <Text style={styles.kpiValue}>{metrics.totalOrders}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.kpiCard}>
                <Text style={{ fontSize: 24 }}>💰</Text>
                <View>
                  <Text style={styles.kpiLabel}>Total Sales</Text>
                  <Text style={styles.kpiValue}>
                    ₹ {Number(metrics.totalSales || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.8}
                onPress={() => router.push('/(dashboard)/customers')}
              >
                <Text style={{ fontSize: 24 }}>👥</Text>
                <View>
                  <Text style={styles.kpiLabel}>New Customers</Text>
                  <Text style={styles.kpiValue}>{metrics.newCustomers}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.8}
                onPress={() => router.push('/(dashboard)/products')}
              >
                <Text style={{ fontSize: 24 }}>👗</Text>
                <View>
                  <Text style={styles.kpiLabel}>Products</Text>
                  <Text style={styles.kpiValue}>{metrics.totalProducts}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Sales Overview */}
            {metrics.salesOverview && metrics.salesOverview.length > 0 ? (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Sales Overview</Text>
                <View style={styles.chartPlaceholder}>
                  {metrics.salesOverview.map((pt, i) => (
                    <Text key={i} style={styles.chartY}>
                      {pt.dateLabel}: ₹ {Number(pt.amount).toLocaleString('en-IN')}
                    </Text>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={{ fontSize: 28, marginBottom: spacing.xs }}>📈</Text>
                <Text style={styles.emptyTitle}>No Sales Activity Yet</Text>
                <Text style={styles.emptySubtitle}>Sales overview will show here as orders start coming in.</Text>
              </View>
            )}

            {/* Top Categories */}
            {metrics.topCategories && metrics.topCategories.length > 0 ? (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Top Categories</Text>
                {metrics.topCategories.map((cat, idx) => (
                  <View key={idx} style={styles.catProgressRow}>
                    <Text style={styles.catNameCol}>{cat.categoryName}</Text>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${cat.percentage}%`, backgroundColor: cat.color || colors.primary }]} />
                    </View>
                    <Text style={styles.catPctCol}>{cat.percentage}%</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: statusBarHeight + spacing.sm,
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
  adminPanelText: {
    fontSize: 10,
    color: colors.secondaryText,
    fontWeight: typography.fontWeights.medium,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  avatarBtn: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 40,
  },
  dashboardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashboardHeading: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  dateBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateBadgeText: {
    fontSize: 10,
    color: colors.secondaryText,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  kpiValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.md,
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
  chartXRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 4,
  },
  chartX: {
    fontSize: 10,
    color: colors.mutedText,
  },
  catProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  catNameCol: {
    width: 80,
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
  catPctCol: {
    width: 32,
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    textAlign: 'right',
  },
  refreshBtn: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshBtnText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
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
  },
});
