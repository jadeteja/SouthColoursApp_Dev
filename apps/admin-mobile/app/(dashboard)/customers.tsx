import React from 'react';
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

export default function CustomerManagementScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const customers = [
    { id: 1, name: 'Priya Sharma', email: 'priya@gmail.com', phone: '+91 9876543210', orders: 12, initial: 'P' },
    { id: 2, name: 'Rohan Gupta', email: 'rohan@gmail.com', phone: '+91 9123456780', orders: 8, initial: 'R' },
    { id: 3, name: 'Sneha Patil', email: 'sneha@gmail.com', phone: '+91 9888876655', orders: 6, initial: 'S' },
    { id: 4, name: 'Amit Verma', email: 'amit@gmail.com', phone: '+91 9876543210', orders: 5, initial: 'A' },
    { id: 5, name: 'Neha Singh', email: 'neha@gmail.com', phone: '+91 7889900112', orders: 4, initial: 'N' },
    { id: 6, name: 'Kavya Reddy', email: 'kavya@gmail.com', phone: '+91 7998888123', orders: 4, initial: 'K' },
  ];

  const filteredCustomers = customers.filter(
    (c) =>
      searchQuery.trim() === '' ||
      c.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      c.phone.includes(searchQuery.trim())
  );

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.brandTitle}>Customers ({filteredCustomers.length})</Text>
        </View>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers by name, email, phone..."
          placeholderTextColor={colors.mutedText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.customerCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.initial}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.customerName}>{item.name}</Text>
              <Text style={styles.customerEmail}>{item.email}</Text>
              <Text style={styles.customerPhone}>{item.phone}</Text>
            </View>
            <View style={styles.orderBadge}>
              <Text style={styles.orderBadgeText}>{item.orders} Orders</Text>
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
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  customerCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  infoCol: {
    flex: 1,
  },
  customerName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  customerEmail: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    marginTop: 1,
  },
  customerPhone: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedText,
    marginTop: 1,
  },
  orderBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  orderBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
});
