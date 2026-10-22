import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function BannerManagementScreen() {
  const router = useRouter();

  const [banners, setBanners] = useState([
    { id: 1, title: 'New Arrivals', date: '01 May - 31 May 2024', isActive: true },
    { id: 2, title: 'Ethnic Wear Sale', date: '01 May - 31 May 2024', isActive: true },
    { id: 3, title: 'Summer Collection', date: '01 May - 31 May 2024', isActive: false },
    { id: 4, title: 'Flat 50% Off', date: '01 May - 31 May 2024', isActive: false },
    { id: 5, title: 'Festive Collection', date: '01 May - 31 May 2024', isActive: true },
  ]);

  const toggleBanner = (id: number) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.brandTitle}>Banners</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => Alert.alert('Add Banner', 'Upload promotional banner graphic')}
        >
          <Text style={styles.addBtnText}>+ Add Banner</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={banners}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.bannerCard}>
            <View style={styles.previewBox}>
              <Text style={{ fontSize: 24 }}>🖼️</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleBanner(item.id)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  addBtnText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  bannerCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewBox: {
    width: 60,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
  },
  titleText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  dateText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    marginTop: 2,
  },
});
