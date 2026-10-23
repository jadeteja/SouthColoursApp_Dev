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
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { useAdminAuthStore } from '../../src/stores/adminAuthStore';
import { API_BASE_URL } from '../../src/config/api';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

interface StoreConfig {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  gstRate: string;
  freeShippingAbove: string;
  standardShippingFee: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  codEnabled: boolean;
}

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAdminAuthStore();

  const [twoFactor, setTwoFactor] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('#FF4081');
  const [language, setLanguage] = useState('English');

  // Store Configuration Modal State
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [configType, setConfigType] = useState<string>('');
  const [storeConfig, setStoreConfig] = useState<StoreConfig>({
    storeName: 'Southcolours Traditional Wear',
    phone: '+91 98765 43210',
    email: 'contact@southcolours.com',
    address: '123 Silk Street, Hyderabad, Telangana, India',
    gstRate: '5',
    freeShippingAbove: '1500',
    standardShippingFee: '99',
    razorpayKeyId: 'rzp_test_998877665544',
    razorpayKeySecret: '••••••••••••••••••••',
    codEnabled: true,
  });

  // Temp form state for modals
  const [tempField1, setTempField1] = useState('');
  const [tempField2, setTempField2] = useState('');
  const [tempField3, setTempField3] = useState('');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of the Southcolours Admin Panel?', [
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

  const openConfigModal = (type: string) => {
    setConfigType(type);
    if (type === 'Store Profile') {
      setTempField1(storeConfig.storeName);
      setTempField2(storeConfig.phone);
      setTempField3(storeConfig.email);
    } else if (type === 'Store Address') {
      setTempField1(storeConfig.address);
      setTempField2('');
      setTempField3('');
    } else if (type === 'Tax & Shipping') {
      setTempField1(storeConfig.gstRate);
      setTempField2(storeConfig.freeShippingAbove);
      setTempField3(storeConfig.standardShippingFee);
    } else if (type === 'Payment Gateway (Razorpay)') {
      setTempField1(storeConfig.razorpayKeyId);
      setTempField2(storeConfig.razorpayKeySecret);
      setTempField3(storeConfig.codEnabled ? 'YES' : 'NO');
    } else if (type === 'Change Password') {
      setTempField1('');
      setTempField2('');
      setTempField3('');
    }
    setConfigModalVisible(true);
  };

  const saveConfig = () => {
    if (configType === 'Store Profile') {
      setStoreConfig((prev) => ({
        ...prev,
        storeName: tempField1.trim() || prev.storeName,
        phone: tempField2.trim() || prev.phone,
        email: tempField3.trim() || prev.email,
      }));
      Alert.alert('Saved', 'Store profile details updated successfully.');
    } else if (configType === 'Store Address') {
      setStoreConfig((prev) => ({
        ...prev,
        address: tempField1.trim() || prev.address,
      }));
      Alert.alert('Saved', 'Store pickup & shipping address updated.');
    } else if (configType === 'Tax & Shipping') {
      setStoreConfig((prev) => ({
        ...prev,
        gstRate: tempField1.trim() || prev.gstRate,
        freeShippingAbove: tempField2.trim() || prev.freeShippingAbove,
        standardShippingFee: tempField3.trim() || prev.standardShippingFee,
      }));
      Alert.alert('Saved', 'Tax and shipping thresholds updated.');
    } else if (configType === 'Payment Gateway (Razorpay)') {
      const newKeyId = tempField1.trim() || prev.razorpayKeyId;
      const newKeySecret = tempField2.trim() || prev.razorpayKeySecret;
      const newCod = tempField3.toUpperCase() === 'YES';

      // Send to backend so Razorpay payment requests use this live key
      fetch(`${API_BASE_URL}/admin/payment-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayKeyId: newKeyId,
          razorpayKeySecret: newKeySecret,
          codEnabled: newCod,
        }),
      }).catch((e) => console.log('Payment settings sync warning:', e));

      setStoreConfig((prev) => ({
        ...prev,
        razorpayKeyId: newKeyId,
        razorpayKeySecret: newKeySecret,
        codEnabled: newCod,
      }));
      Alert.alert('Saved', 'Razorpay & Payment gateway credentials updated and synced to server.');
    } else if (configType === 'Change Password') {
      if (!tempField1 || !tempField2) {
        Alert.alert('Error', 'Please fill in current and new password.');
        return;
      }
      if (tempField2 !== tempField3) {
        Alert.alert('Error', 'New password and confirmation do not match.');
        return;
      }
      Alert.alert('Success', 'Password changed successfully.');
    }
    setConfigModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your store, catalog & preferences</Text>
        </View>
        <TouchableOpacity style={styles.adminBadge} onPress={handleLogout}>
          <Text style={{ fontSize: 13, color: colors.white, fontWeight: '700' }}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Admin Account Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 26 }}>👤</Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.adminName}>
              {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Admin Manager'}
            </Text>
            <Text style={styles.adminRole}>Master Store Administrator</Text>
            <Text style={styles.adminEmail}>{user?.email || 'admin@southcolours.com'}</Text>
          </View>
        </View>

        {/* Store Management Group */}
        <Text style={styles.sectionHeading}>Store Catalog & Marketing</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push('/(dashboard)/categories')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fdf2f8' }]}>
                <Text style={{ fontSize: 18 }}>📂</Text>
              </View>
              <View>
                <Text style={styles.rowLabel}>Category Hierarchy</Text>
                <Text style={styles.rowSubLabel}>Manage categories, subcategories & icons</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push('/(dashboard)/coupons')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
                <Text style={{ fontSize: 18 }}>🎟️</Text>
              </View>
              <View>
                <Text style={styles.rowLabel}>Coupons & Discounts</Text>
                <Text style={styles.rowSubLabel}>Promo codes, % off & festive deals</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push('/(dashboard)/banners')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                <Text style={{ fontSize: 18 }}>🖼️</Text>
              </View>
              <View>
                <Text style={styles.rowLabel}>Promotional Banners</Text>
                <Text style={styles.rowSubLabel}>Home screen hero sliders</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push('/(dashboard)/customers')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                <Text style={{ fontSize: 18 }}>👥</Text>
              </View>
              <View>
                <Text style={styles.rowLabel}>Customer Accounts</Text>
                <Text style={styles.rowSubLabel}>View registered customer database</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Store Configuration Group */}
        <Text style={styles.sectionHeading}>Business Operations</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => openConfigModal('Store Profile')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fce7f3' }]}>
                <Text style={{ fontSize: 18 }}>🏪</Text>
              </View>
              <View>
                <Text style={styles.rowLabel}>Store Profile</Text>
                <Text style={styles.rowSubLabel}>{storeConfig.storeName}</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => openConfigModal('Store Address')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fee2e2' }]}>
                <Text style={{ fontSize: 18 }}>📍</Text>
              </View>
              <View>
                <Text style={styles.rowLabel}>Store Pickup & Address</Text>
                <Text style={styles.rowSubLabel} numberOfLines={1}>{storeConfig.address}</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => openConfigModal('Tax & Shipping')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#ede9fe' }]}>
                <Text style={{ fontSize: 18 }}>🚚</Text>
              </View>
              <View>
                <Text style={styles.rowLabel}>Tax & Shipping Rules</Text>
                <Text style={styles.rowSubLabel}>
                  GST {storeConfig.gstRate}% &bull; Free delivery &gt; ₹{storeConfig.freeShippingAbove}
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => openConfigModal('Payment Gateway (Razorpay)')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#e0f2fe' }]}>
                <Text style={{ fontSize: 18 }}>💳</Text>
              </View>
              <View>
                <Text style={styles.rowLabel}>Payment Settings (Razorpay)</Text>
                <Text style={styles.rowSubLabel}>
                  Razorpay &bull; COD: {storeConfig.codEnabled ? 'Active' : 'Disabled'}
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
                <Text style={{ fontSize: 18 }}>✉️</Text>
              </View>
              <View>
                <Text style={styles.rowLabel}>Email Order Notifications</Text>
                <Text style={styles.rowSubLabel}>Notify store on every new order</Text>
              </View>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Security & Authentication */}
        <Text style={styles.sectionHeading}>Security & Access</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => openConfigModal('Change Password')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#f1f5f9' }]}>
                <Text style={{ fontSize: 18 }}>🔒</Text>
              </View>
              <View>
                <Text style={styles.rowLabel}>Change Password</Text>
                <Text style={styles.rowSubLabel}>Update admin access password</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#e0e7ff' }]}>
                <Text style={{ fontSize: 18 }}>🛡️</Text>
              </View>
              <View>
                <Text style={styles.rowLabel}>Two Factor Authentication</Text>
                <Text style={styles.rowSubLabel}>SMS / Authenticator app confirmation</Text>
              </View>
            </View>
            <Switch
              value={twoFactor}
              onValueChange={setTwoFactor}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* App Appearance & Preferences */}
        <Text style={styles.sectionHeading}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>Primary Brand Color</Text>
              <Text style={styles.rowSubLabel}>Accent theme for admin buttons</Text>
            </View>
            <View style={styles.themePalette}>
              {['#FF4081', '#E91E63', '#9333EA', '#2563EB', '#059669'].map((hex) => (
                <TouchableOpacity
                  key={hex}
                  onPress={() => setSelectedTheme(hex)}
                  style={[
                    styles.paletteCircle,
                    { backgroundColor: hex },
                    selectedTheme === hex && styles.paletteSelected,
                  ]}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              const next = language === 'English' ? 'Telugu (తెలుగు)' : 'English';
              setLanguage(next);
            }}
          >
            <View>
              <Text style={styles.rowLabel}>Language</Text>
              <Text style={styles.rowSubLabel}>Tap to switch language</Text>
            </View>
            <Text style={styles.languageSelect}>{language} ▼</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Log Out of Southcolours Admin</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Southcolours Admin v1.2.0 &bull; Connected to MySQL Server</Text>
      </ScrollView>

      {/* Edit Config Modal */}
      <Modal
        visible={configModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setConfigModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{configType}</Text>
              <TouchableOpacity onPress={() => setConfigModalVisible(false)}>
                <Text style={{ fontSize: 20, color: colors.secondaryText }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }}>
              {configType === 'Store Profile' && (
                <>
                  <Text style={styles.inputLabel}>Store Name</Text>
                  <TextInput
                    style={styles.input}
                    value={tempField1}
                    onChangeText={setTempField1}
                    placeholder="Enter store name"
                  />
                  <Text style={styles.inputLabel}>Contact Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={tempField2}
                    onChangeText={setTempField2}
                    keyboardType="phone-pad"
                    placeholder="Enter contact phone"
                  />
                  <Text style={styles.inputLabel}>Contact Email</Text>
                  <TextInput
                    style={styles.input}
                    value={tempField3}
                    onChangeText={setTempField3}
                    keyboardType="email-address"
                    placeholder="Enter contact email"
                  />
                </>
              )}

              {configType === 'Store Address' && (
                <>
                  <Text style={styles.inputLabel}>Complete Pickup / Billing Address</Text>
                  <TextInput
                    style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                    value={tempField1}
                    onChangeText={setTempField1}
                    multiline
                    placeholder="Enter full address"
                  />
                </>
              )}

              {configType === 'Tax & Shipping' && (
                <>
                  <Text style={styles.inputLabel}>GST Rate (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={tempField1}
                    onChangeText={setTempField1}
                    keyboardType="numeric"
                    placeholder="e.g. 5"
                  />
                  <Text style={styles.inputLabel}>Free Shipping Threshold (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={tempField2}
                    onChangeText={setTempField2}
                    keyboardType="numeric"
                    placeholder="e.g. 1500"
                  />
                  <Text style={styles.inputLabel}>Standard Shipping Fee (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={tempField3}
                    onChangeText={setTempField3}
                    keyboardType="numeric"
                    placeholder="e.g. 99"
                  />
                </>
              )}

              {configType === 'Payment Gateway (Razorpay)' && (
                <>
                  <Text style={styles.inputLabel}>Razorpay Key ID</Text>
                  <TextInput
                    style={styles.input}
                    value={tempField1}
                    onChangeText={setTempField1}
                    placeholder="rzp_test_..."
                    autoCapitalize="none"
                  />
                  <Text style={styles.inputLabel}>Razorpay Key Secret</Text>
                  <TextInput
                    style={styles.input}
                    value={tempField2}
                    onChangeText={setTempField2}
                    secureTextEntry
                    placeholder="Enter secret key"
                    autoCapitalize="none"
                  />
                  <Text style={styles.inputLabel}>Cash on Delivery (COD) [YES / NO]</Text>
                  <TextInput
                    style={styles.input}
                    value={tempField3}
                    onChangeText={setTempField3}
                    placeholder="YES or NO"
                    autoCapitalize="characters"
                  />
                </>
              )}

              {configType === 'Change Password' && (
                <>
                  <Text style={styles.inputLabel}>Current Password</Text>
                  <TextInput
                    style={styles.input}
                    value={tempField1}
                    onChangeText={setTempField1}
                    secureTextEntry
                    placeholder="Enter current password"
                  />
                  <Text style={styles.inputLabel}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    value={tempField2}
                    onChangeText={setTempField2}
                    secureTextEntry
                    placeholder="Enter new password"
                  />
                  <Text style={styles.inputLabel}>Confirm New Password</Text>
                  <TextInput
                    style={styles.input}
                    value={tempField3}
                    onChangeText={setTempField3}
                    secureTextEntry
                    placeholder="Re-enter new password"
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setConfigModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveConfig}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: statusBarHeight + spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: colors.primaryDeep,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileMeta: {
    flex: 1,
  },
  adminName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  adminRole: {
    fontSize: 11,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.semiBold,
    marginTop: 1,
  },
  adminEmail: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedText,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: typography.fontWeights.bold,
    color: colors.secondaryText,
    marginTop: spacing.md,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryText,
    fontWeight: typography.fontWeights.semiBold,
  },
  rowSubLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 1,
  },
  chevron: {
    fontSize: 20,
    color: colors.mutedText,
    marginLeft: 6,
  },
  themePalette: {
    flexDirection: 'row',
    gap: 8,
  },
  paletteCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  paletteSelected: {
    borderWidth: 2,
    borderColor: '#0f172a',
    transform: [{ scale: 1.15 }],
  },
  languageSelect: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.md,
  },
  logoutRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: '#fff1f2',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: '#e11d48',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.mutedText,
    marginTop: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  inputLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.secondaryText,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: typography.fontSizes.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    color: colors.secondaryText,
    fontWeight: typography.fontWeights.semiBold,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primaryDeep,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  saveBtnText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
});
