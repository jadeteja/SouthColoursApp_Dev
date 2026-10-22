import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { useAdminAuthStore } from '../../src/stores/adminAuthStore';

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { logout } = useAdminAuthStore();
  const [twoFactor, setTwoFactor] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Log out of Southcolours Admin Panel?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const handleAction = (title: string, route?: string) => {
    if (route) {
      router.push(route as any);
    } else {
      Alert.alert(title, `Configure ${title} settings in store.`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header with Safe Top Padding */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Links Group (Coupons, Banners, Customers, Categories) */}
        <Text style={styles.sectionHeading}>Store Management</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => handleAction('Customers', '/(dashboard)/customers')}>
            <View style={styles.rowLeft}>
              <Text style={{ fontSize: 18 }}>👥</Text>
              <Text style={styles.rowLabel}>Customers Management</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => handleAction('Coupons', '/(dashboard)/coupons')}>
            <View style={styles.rowLeft}>
              <Text style={{ fontSize: 18 }}>🎟️</Text>
              <Text style={styles.rowLabel}>Coupons & Discounts</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => handleAction('Banners', '/(dashboard)/banners')}>
            <View style={styles.rowLeft}>
              <Text style={{ fontSize: 18 }}>🖼️</Text>
              <Text style={styles.rowLabel}>Promotional Banners</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => handleAction('Categories', '/(dashboard)/categories')}>
            <View style={styles.rowLeft}>
              <Text style={{ fontSize: 18 }}>📂</Text>
              <Text style={styles.rowLabel}>Category Hierarchy</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Store Settings Group */}
        <Text style={styles.sectionHeading}>Store Settings</Text>
        <View style={styles.card}>
          {[
            { label: 'Store Profile', icon: '🏪' },
            { label: 'Store Address', icon: '📍' },
            { label: 'Tax Settings', icon: '🧾' },
            { label: 'Shipping Settings', icon: '🚚' },
            { label: 'Payment Settings (Razorpay)', icon: '💳' },
            { label: 'Email Notifications', icon: '✉️' },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.row} onPress={() => handleAction(item.label)}>
              <View style={styles.rowLeft}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                <Text style={styles.rowLabel}>{item.label}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Admin Settings Group */}
        <Text style={styles.sectionHeading}>Admin Settings</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => handleAction('Manage Admin Users')}>
            <View style={styles.rowLeft}>
              <Text style={{ fontSize: 18 }}>👤</Text>
              <Text style={styles.rowLabel}>Manage Admin Users</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => handleAction('Change Password')}>
            <View style={styles.rowLeft}>
              <Text style={{ fontSize: 18 }}>🔒</Text>
              <Text style={styles.rowLabel}>Change Password</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={{ fontSize: 18 }}>🛡️</Text>
              <Text style={styles.rowLabel}>Two Factor Authentication</Text>
            </View>
            <Switch
              value={twoFactor}
              onValueChange={setTwoFactor}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* App Settings Group */}
        <Text style={styles.sectionHeading}>App Settings</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>App Theme</Text>
            <View style={styles.themePalette}>
              {['#FF4081', '#E91E63', '#FFA726', '#29B6F6', '#AB47BC'].map((hex) => (
                <View key={hex} style={[styles.paletteCircle, { backgroundColor: hex }]} />
              ))}
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Language</Text>
            <Text style={styles.languageSelect}>English ▼</Text>
          </View>
          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primarySoft,
  },
  header: {
    paddingTop: statusBarHeight + spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: 60,
  },
  sectionHeading: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryText,
    fontWeight: typography.fontWeights.medium,
  },
  chevron: {
    fontSize: 20,
    color: colors.mutedText,
  },
  themePalette: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  paletteCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  languageSelect: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
  logoutRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  logoutText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.error,
  },
});
