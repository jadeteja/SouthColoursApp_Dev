import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
  Modal,
  TextInput,
  Switch,
  Share,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { useAuthStore } from '../../src/stores/authStore';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

interface AddressItem {
  id: number;
  label: string;
  name: string;
  address: string;
  phone: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Profile Edit State
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [profileName, setProfileName] = useState(user?.fullName || 'Priya Sharma');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'priya@gmail.com');
  const [profilePhone, setProfilePhone] = useState('+91 98765 43210');

  // Address Modal State
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: 1,
      label: 'Home',
      name: 'Priya Sharma',
      address: 'Plot 42, Jubilee Hills, Road No. 10, Hyderabad, Telangana - 500033',
      phone: '+91 98765 43210',
    },
    {
      id: 2,
      label: 'Office',
      name: 'Priya Sharma',
      address: 'Building 5, Cyber Gateway, Hitech City, Hyderabad - 500081',
      phone: '+91 91234 56789',
    },
  ]);
  const [newLabel, setNewLabel] = useState('Home');
  const [newFullAddress, setNewFullAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Notifications Modal State
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [offerAlerts, setOfferAlerts] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);

  // Help & Support Modal State
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  // Settings Modal State
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Telugu (తెలుగు)'>('English');
  const [selectedThemeColor, setSelectedThemeColor] = useState('#E11D48');
  const [legalModalContent, setLegalModalContent] = useState<{ title: string; content: string } | null>(null);

  // Refer & Earn Handler
  const handleReferAndEarn = async () => {
    try {
      await Share.share({
        message: '🌸 Discover exquisite kids traditional wear & lehengas at Southcolours! Use my invite code "PRIYA20" to get ₹200 off your first purchase: https://southcolours.com/app',
        title: 'Invite Friends to Southcolours',
      });
    } catch {
      Alert.alert('Refer & Earn', 'Share your referral code "PRIYA20" to earn ₹200 for every friend who orders!');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out of Southcolours?', [
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

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    setEditProfileVisible(false);
    Alert.alert('Saved', 'Your profile details have been updated successfully.');
  };

  const handleAddAddress = () => {
    if (!newFullAddress.trim()) {
      Alert.alert('Required', 'Please enter your address.');
      return;
    }
    const newEntry: AddressItem = {
      id: Date.now(),
      label: newLabel,
      name: profileName,
      address: newFullAddress.trim(),
      phone: newPhone.trim() || profilePhone,
    };
    setAddresses([...addresses, newEntry]);
    setNewFullAddress('');
    setNewPhone('');
    Alert.alert('Address Added', 'Your delivery address has been saved.');
  };

  const handleDeleteAddress = (id: number) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 36 }}>👧</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profileName}</Text>
            <Text style={styles.userEmail}>{profileEmail}</Text>
            <Text style={styles.userPhone}>{profilePhone}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditProfileVisible(true)}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Orders & Shopping Section */}
        <Text style={styles.sectionHeading}>My Shopping</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/orders')}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                <Text style={{ fontSize: 18 }}>📦</Text>
              </View>
              <Text style={styles.menuTitle}>My Orders</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/wishlist')}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fdf2f8' }]}>
                <Text style={{ fontSize: 18 }}>❤️</Text>
              </View>
              <Text style={styles.menuTitle}>Wishlist</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/cart')}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
                <Text style={{ fontSize: 18 }}>🛍️</Text>
              </View>
              <Text style={styles.menuTitle}>Shopping Bag</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings Section */}
        <Text style={styles.sectionHeading}>Account & Preferences</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuRow} onPress={() => setAddressModalVisible(true)}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                <Text style={{ fontSize: 18 }}>📍</Text>
              </View>
              <View>
                <Text style={styles.menuTitle}>Delivery Addresses</Text>
                <Text style={styles.menuSub}>{addresses.length} saved addresses</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/checkout')}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#ede9fe' }]}>
                <Text style={{ fontSize: 18 }}>💳</Text>
              </View>
              <View>
                <Text style={styles.menuTitle}>Saved Payments & UPI</Text>
                <Text style={styles.menuSub}>Razorpay & Google Pay</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={handleReferAndEarn}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fce7f3' }]}>
                <Text style={{ fontSize: 18 }}>🎁</Text>
              </View>
              <View>
                <Text style={styles.menuTitle}>Refer & Earn</Text>
                <Text style={styles.menuSub}>Get ₹200 for every friend invite</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={() => setNotifModalVisible(true)}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fef9c3' }]}>
                <Text style={{ fontSize: 18 }}>🔔</Text>
              </View>
              <Text style={styles.menuTitle}>Notifications</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={() => setHelpModalVisible(true)}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#e0f2fe' }]}>
                <Text style={{ fontSize: 18 }}>💬</Text>
              </View>
              <Text style={styles.menuTitle}>Help & Customer Support</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={() => setSettingsModalVisible(true)}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#f1f5f9' }]}>
                <Text style={{ fontSize: 18 }}>⚙️</Text>
              </View>
              <Text style={styles.menuTitle}>App Settings</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <Text style={{ fontSize: 20 }}>🚪</Text>
              <Text style={styles.logoutTitle}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionNote}>Southcolours v1.2.0 &bull; Handcrafted with Love</Text>
      </ScrollView>

      {/* 1. Edit Profile Modal */}
      <Modal visible={editProfileVisible} transparent animationType="slide" onRequestClose={() => setEditProfileVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditProfileVisible(false)}>
                <Text style={{ fontSize: 20, color: colors.secondaryText }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput style={styles.input} value={profileName} onChangeText={setProfileName} placeholder="Enter your name" />
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput style={styles.input} value={profileEmail} onChangeText={setProfileEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.inputLabel}>Mobile Phone</Text>
            <TextInput style={styles.input} value={profilePhone} onChangeText={setProfilePhone} keyboardType="phone-pad" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditProfileVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. Delivery Addresses Modal */}
      <Modal visible={addressModalVisible} transparent animationType="slide" onRequestClose={() => setAddressModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery Addresses</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Text style={{ fontSize: 20, color: colors.secondaryText }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {addresses.map((item) => (
                <View key={item.id} style={styles.addressBox}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <View style={styles.addressTag}>
                      <Text style={styles.addressTagText}>{item.label}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteAddress(item.id)}>
                      <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: 'bold' }}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.addressName}>{item.name}</Text>
                  <Text style={styles.addressText}>{item.address}</Text>
                  <Text style={styles.addressPhone}>📞 {item.phone}</Text>
                </View>
              ))}

              <Text style={[styles.sectionHeading, { marginTop: spacing.md }]}>+ Add New Address</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
                {['Home', 'Office', 'Other'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.tagSelect, newLabel === t && styles.tagSelectActive]}
                    onPress={() => setNewLabel(t)}
                  >
                    <Text style={[styles.tagSelectText, newLabel === t && styles.tagSelectTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
                value={newFullAddress}
                onChangeText={setNewFullAddress}
                placeholder="House No, Street, Area, City, Pincode"
                multiline
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={newPhone}
                onChangeText={setNewPhone}
                placeholder="Contact Phone Number"
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={[styles.saveBtn, { marginTop: 12, paddingVertical: 12 }]} onPress={handleAddAddress}>
                <Text style={styles.saveBtnText}>Save Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 3. Notifications Modal */}
      <Modal visible={notifModalVisible} transparent animationType="fade" onRequestClose={() => setNotifModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Settings</Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                <Text style={{ fontSize: 20, color: colors.secondaryText }}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Order & Delivery Updates</Text>
                <Text style={styles.switchSub}>Real-time tracking of dispatch & arrival</Text>
              </View>
              <Switch value={orderUpdates} onValueChange={setOrderUpdates} trackColor={{ false: colors.border, true: colors.primary }} />
            </View>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Discounts & Festival Offers</Text>
                <Text style={styles.switchSub}>Exclusive discounts & early sale access</Text>
              </View>
              <Switch value={offerAlerts} onValueChange={setOfferAlerts} trackColor={{ false: colors.border, true: colors.primary }} />
            </View>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>WhatsApp Order Receipts</Text>
                <Text style={styles.switchSub}>Receive invoices directly on WhatsApp</Text>
              </View>
              <Switch value={whatsappUpdates} onValueChange={setWhatsappUpdates} trackColor={{ false: colors.border, true: colors.primary }} />
            </View>
            <TouchableOpacity style={[styles.saveBtn, { marginTop: spacing.md }]} onPress={() => setNotifModalVisible(false)}>
              <Text style={styles.saveBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 4. Help & Support Modal */}
      <Modal visible={helpModalVisible} transparent animationType="slide" onRequestClose={() => setHelpModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customer Support</Text>
              <TouchableOpacity onPress={() => setHelpModalVisible(false)}>
                <Text style={{ fontSize: 20, color: colors.secondaryText }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: colors.secondaryText, marginBottom: spacing.md }}>
              We are here to assist with sizes, delivery updates, returns, or order questions!
            </Text>
            <TouchableOpacity
              style={styles.supportOption}
              onPress={() => Linking.openURL('whatsapp://send?phone=+919876543210&text=Hi%20Southcolours,%20I%20need%20help%20with%20an%20order')}
            >
              <Text style={{ fontSize: 24 }}>💬</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.supportTitle}>Chat on WhatsApp</Text>
                <Text style={styles.supportSub}>Instant replies (10 AM - 8 PM)</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.supportOption}
              onPress={() => Linking.openURL('tel:+919876543210')}
            >
              <Text style={{ fontSize: 24 }}>📞</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.supportTitle}>Call Customer Care</Text>
                <Text style={styles.supportSub}>+91 98765 43210</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.supportOption}
              onPress={() => Linking.openURL('mailto:support@southcolours.com?subject=Order%20Help')}
            >
              <Text style={{ fontSize: 24 }}>✉️</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.supportTitle}>Email Support</Text>
                <Text style={styles.supportSub}>support@southcolours.com</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 5. App Settings Modal */}
      <Modal visible={settingsModalVisible} transparent animationType="slide" onRequestClose={() => setSettingsModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>App Settings</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Text style={{ fontSize: 20, color: colors.secondaryText }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Language Selection */}
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionLabel}>Preferred Language</Text>
                <View style={styles.langRow}>
                  {(['English', 'Telugu (తెలుగు)'] as const).map((lang) => (
                    <TouchableOpacity
                      key={lang}
                      style={[styles.langChoice, selectedLanguage === lang && styles.langChoiceActive]}
                      onPress={() => setSelectedLanguage(lang)}
                    >
                      <Text style={[styles.langChoiceText, selectedLanguage === lang && styles.langChoiceTextActive]}>
                        {selectedLanguage === lang ? '✓ ' : ''}{lang}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Theme Accent Color */}
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionLabel}>App Accent Theme</Text>
                <View style={styles.themePaletteRow}>
                  {['#E11D48', '#FF4081', '#9333EA', '#2563EB', '#059669'].map((hex) => (
                    <TouchableOpacity
                      key={hex}
                      onPress={() => setSelectedThemeColor(hex)}
                      style={[
                        styles.themeCircle,
                        { backgroundColor: hex },
                        selectedThemeColor === hex && styles.themeCircleActive,
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Country & Region */}
              <View style={styles.settingRow}>
                <View>
                  <Text style={styles.settingLabel}>Region & Currency</Text>
                  <Text style={styles.settingSub}>Prices shown in Indian Rupee</Text>
                </View>
                <Text style={styles.settingVal}>🇮🇳 India (₹ INR)</Text>
              </View>

              {/* Cache & Data */}
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => {
                  Alert.alert('Cache Cleared', 'Local app images and temporary cache have been refreshed.');
                }}
              >
                <View>
                  <Text style={styles.settingLabel}>Clear Image Cache</Text>
                  <Text style={styles.settingSub}>Free up local temporary storage</Text>
                </View>
                <Text style={[styles.settingVal, { color: colors.primaryDeep }]}>Clear Now</Text>
              </TouchableOpacity>

              {/* Privacy Policy */}
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => {
                  setLegalModalContent({
                    title: 'Privacy Policy',
                    content: 'At Southcolours, we respect your privacy and protect your personal information. Your addresses, orders, and payment data are encrypted with bank-level 256-bit SSL protocols. We never share your phone number or data with third-party advertisers.',
                  });
                }}
              >
                <Text style={styles.settingLabel}>Privacy Policy</Text>
                <Text style={[styles.settingVal, { color: colors.primaryDeep }]}>Read ›</Text>
              </TouchableOpacity>

              {/* Terms of Service */}
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => {
                  setLegalModalContent({
                    title: 'Terms of Service',
                    content: 'Welcome to Southcolours. All ethnic wear designs, pictures, and catalog contents are copyrighted. Orders are fulfilled within 24-48 business hours. We offer hassle-free 7-day size exchanges on all unwashed dresses.',
                  });
                }}
              >
                <Text style={styles.settingLabel}>Terms of Service</Text>
                <Text style={[styles.settingVal, { color: colors.primaryDeep }]}>Read ›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.saveBtn, { marginTop: spacing.lg }]} onPress={() => setSettingsModalVisible(false)}>
                <Text style={styles.saveBtnText}>Save Preferences</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 6. Legal / Policy Viewer Modal */}
      <Modal visible={!!legalModalContent} transparent animationType="fade" onRequestClose={() => setLegalModalContent(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{legalModalContent?.title}</Text>
              <TouchableOpacity onPress={() => setLegalModalContent(null)}>
                <Text style={{ fontSize: 20, color: colors.secondaryText }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: colors.primaryText, lineHeight: 22, marginVertical: spacing.md }}>
              {legalModalContent?.content}
            </Text>
            <TouchableOpacity style={styles.saveBtn} onPress={() => setLegalModalContent(null)}>
              <Text style={styles.saveBtnText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: statusBarHeight,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 11,
    color: colors.mutedText,
  },
  editBtn: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  editBtnText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
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
  menuContainer: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuLeft: {
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
  menuTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  menuSub: {
    fontSize: 11,
    color: colors.mutedText,
    marginTop: 1,
  },
  chevron: {
    fontSize: 20,
    color: colors.mutedText,
  },
  logoutRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: '#fff1f2',
  },
  logoutTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: '#e11d48',
  },
  versionNote: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.mutedText,
    marginTop: spacing.lg,
  },
  modalBackdrop: {
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
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
    marginTop: spacing.xs,
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
    backgroundColor: colors.primary,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  saveBtnText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
  addressBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: '#f8fafc',
  },
  addressTag: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  addressTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primaryDeep,
  },
  addressName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: 2,
  },
  addressText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    lineHeight: 16,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 11,
    color: colors.primaryDeep,
    fontWeight: '600',
  },
  tagSelect: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  tagSelectActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  tagSelectText: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  tagSelectTextActive: {
    color: colors.primaryDeep,
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  switchTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  switchSub: {
    fontSize: 11,
    color: colors.mutedText,
    marginTop: 2,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    backgroundColor: '#f8fafc',
  },
  supportTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  supportSub: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  settingSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingSectionLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.secondaryText,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryText,
    fontWeight: typography.fontWeights.medium,
  },
  settingSub: {
    fontSize: 11,
    color: colors.mutedText,
    marginTop: 2,
  },
  settingVal: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langChoice: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  langChoiceActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  langChoiceText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    fontWeight: typography.fontWeights.medium,
  },
  langChoiceTextActive: {
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
  themePaletteRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  themeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  themeCircleActive: {
    borderWidth: 3,
    borderColor: '#0f172a',
    transform: [{ scale: 1.15 }],
  },
});
