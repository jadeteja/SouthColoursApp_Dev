import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';

const screenWidth = Dimensions.get('window').width;
const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function AdminDashboardScreen() {
  const router = useRouter();

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

      <ScrollView contentContainerStyle={styles.content}>
        {/* Date Filter Strip */}
        <View style={styles.dashboardTitleRow}>
          <Text style={styles.dashboardHeading}>Dashboard</Text>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>📅 01 May 2024 - 31 May 2024</Text>
          </View>
        </View>

        {/* 2x2 Metric KPI Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={{ fontSize: 24 }}>🛍️</Text>
            <View>
              <Text style={styles.kpiLabel}>Total Orders</Text>
              <Text style={styles.kpiValue}>542</Text>
            </View>
          </View>
          <View style={styles.kpiCard}>
            <Text style={{ fontSize: 24 }}>💰</Text>
            <View>
              <Text style={styles.kpiLabel}>Total Sales</Text>
              <Text style={styles.kpiValue}>₹ 4,32,890</Text>
            </View>
          </View>
          <View style={styles.kpiCard}>
            <Text style={{ fontSize: 24 }}>👥</Text>
            <View>
              <Text style={styles.kpiLabel}>New Customers</Text>
              <Text style={styles.kpiValue}>320</Text>
            </View>
          </View>
          <View style={styles.kpiCard}>
            <Text style={{ fontSize: 24 }}>👗</Text>
            <View>
              <Text style={styles.kpiLabel}>Products</Text>
              <Text style={styles.kpiValue}>248</Text>
            </View>
          </View>
        </View>

        {/* Sales Overview Chart Card */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Sales Overview</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartY}>400K ─── 📈 ~~~~~~~~~~~~~~</Text>
            <Text style={styles.chartY}>200K ─── 📈 ~~~~~~~~~~</Text>
            <Text style={styles.chartY}>100K ─── 📈 ~~~~</Text>
            <View style={styles.chartXRow}>
              <Text style={styles.chartX}>1 May</Text>
              <Text style={styles.chartX}>8 May</Text>
              <Text style={styles.chartX}>15 May</Text>
              <Text style={styles.chartX}>22 May</Text>
              <Text style={styles.chartX}>31 May</Text>
            </View>
          </View>
        </View>

        {/* Top Categories Progress Bars */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Top Categories</Text>
          {[
            { name: 'Ethnic Wear', pct: 42, color: colors.primary },
            { name: 'Dresses', pct: 28, color: '#FFA726' },
            { name: 'Tops', pct: 15, color: '#29B6F6' },
            { name: 'Bottoms', pct: 10, color: '#66BB6A' },
            { name: 'Others', pct: 5, color: '#AB47BC' },
          ].map((cat, idx) => (
            <View key={idx} style={styles.catProgressRow}>
              <Text style={styles.catNameCol}>{cat.name}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${cat.pct * 2}%`, backgroundColor: cat.color }]} />
              </View>
              <Text style={styles.catPctCol}>{cat.pct}%</Text>
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
});
