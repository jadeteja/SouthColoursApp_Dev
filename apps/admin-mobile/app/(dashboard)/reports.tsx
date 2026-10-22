import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function AdminReportsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Sales');

  const topSelling = [
    { name: 'Pink Lehenga Set', count: 120, pct: 90, color: colors.primary },
    { name: 'Yellow Anarkali', count: 98, pct: 75, color: '#FFA726' },
    { name: "Boy's Kurta Set", count: 75, pct: 58, color: '#29B6F6' },
    { name: 'Floral Dress', count: 62, pct: 48, color: '#66BB6A' },
  ];

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Reports</Text>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>📅 01 May 2024 - 31 May 2024</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {['Sales', 'Orders', 'Customers', 'Products'].map((tab) => (
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

      <ScrollView contentContainerStyle={styles.content}>
        {/* Sales Summary 4-Box Metric Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Sales Summary</Text>
          <View style={styles.metricGrid}>
            <View style={styles.metricBox}>
              <Text style={{ fontSize: 20 }}>💰</Text>
              <View>
                <Text style={styles.metricLabel}>Total Sales</Text>
                <Text style={styles.metricValue}>₹ 4,32,890</Text>
              </View>
            </View>
            <View style={styles.metricBox}>
              <Text style={{ fontSize: 20 }}>🛍️</Text>
              <View>
                <Text style={styles.metricLabel}>Total Orders</Text>
                <Text style={styles.metricValue}>542</Text>
              </View>
            </View>
            <View style={styles.metricBox}>
              <Text style={{ fontSize: 20 }}>🏷️</Text>
              <View>
                <Text style={styles.metricLabel}>Avg. Order Value</Text>
                <Text style={styles.metricValue}>₹ 798</Text>
              </View>
            </View>
            <View style={styles.metricBox}>
              <Text style={{ fontSize: 20 }}>👥</Text>
              <View>
                <Text style={styles.metricLabel}>New Customers</Text>
                <Text style={styles.metricValue}>320</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sales Trend Line Chart Card */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Sales Trend</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartY}>400K ─── 📈 ~~~~~~~~~~~~~~~~~~~~</Text>
            <Text style={styles.chartY}>200K ─── 📈 ~~~~~~~~~~~~~~</Text>
            <Text style={styles.chartY}>100K ─── 📈 ~~~~~~</Text>
            <View style={styles.chartXRow}>
              <Text style={styles.chartX}>1 May</Text>
              <Text style={styles.chartX}>8 May</Text>
              <Text style={styles.chartX}>15 May</Text>
              <Text style={styles.chartX}>22 May</Text>
              <Text style={styles.chartX}>31 May</Text>
            </View>
          </View>
        </View>

        {/* Top Selling Products Progress Bars */}
        <View style={styles.topSellingCard}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>
          {topSelling.map((prod, idx) => (
            <View key={idx} style={styles.prodRow}>
              <View style={styles.prodThumb}><Text style={{ fontSize: 20 }}>👗</Text></View>
              <View style={styles.prodNameCol}>
                <Text style={styles.prodName}>{prod.name}</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${prod.pct}%`, backgroundColor: prod.color }]} />
                </View>
              </View>
              <Text style={styles.prodCount}>{prod.count}</Text>
            </View>
          ))}
        </View>
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
  dateBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  dateBadgeText: {
    fontSize: 10,
    color: colors.primaryText,
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
  topSellingCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  prodThumb: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodNameCol: {
    flex: 1,
  },
  prodName: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.primaryText,
    marginBottom: 4,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  prodCount: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.secondaryText,
    width: 30,
    textAlign: 'right',
  },
});
