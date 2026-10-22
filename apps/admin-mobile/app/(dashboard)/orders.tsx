import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function AdminOrdersListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const orders = [
    {
      id: 1,
      orderNumber: '#SC123456',
      customer: 'Priya Sharma',
      date: '12 May 2024',
      amount: 5697,
      status: 'Delivered',
      color: colors.success,
    },
    {
      id: 2,
      orderNumber: '#SC123455',
      customer: 'Rohan Gupta',
      date: '11 May 2024',
      amount: 1899,
      status: 'Shipped',
      color: '#2196F3',
    },
    {
      id: 3,
      orderNumber: '#SC123454',
      customer: 'Sneha Patil',
      date: '10 May 2024',
      amount: 2499,
      status: 'Processing',
      color: colors.warning,
    },
    {
      id: 4,
      orderNumber: '#SC123453',
      customer: 'Amit Verma',
      date: '09 May 2024',
      amount: 999,
      status: 'Pending',
      color: '#9E9E9E',
    },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'All' || o.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      o.orderNumber.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      o.customer.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      o.amount.toString().includes(searchQuery.trim());
    return matchesTab && matchesSearch;
  });

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Orders ({filteredOrders.length})</Text>
        <TouchableOpacity style={styles.dateFilter}>
          <Text style={styles.dateFilterText}>📅 01 May 2024 - 31 May 2024</Text>
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
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => router.push(`/(dashboard)/order-details?id=${item.id}`)}
          >
            <View style={styles.thumb}><Text style={{ fontSize: 26 }}>👗</Text></View>
            <View style={styles.infoCol}>
              <Text style={styles.orderNum}>{item.orderNumber}</Text>
              <Text style={styles.orderDate}>{item.date}</Text>
              <Text style={styles.customerName}>{item.customer}</Text>
              <Text style={styles.amount}>₹ {item.amount}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.primarySoft }]}>
              <Text style={[styles.statusText, { color: item.color }]}>{item.status}</Text>
            </View>
          </TouchableOpacity>
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
  brandTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  dateFilter: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
  },
  dateFilterText: {
    fontSize: 10,
    color: colors.primaryText,
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
