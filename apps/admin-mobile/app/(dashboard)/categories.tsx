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
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { useCategoryStore } from '../../src/stores/categoryStore';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function CategoryManagementScreen() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number[]>([1, 2]);
  const categories = useCategoryStore((state) => state.categories);

  const toggleExpand = (id: number) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.brandTitle}>Categories</Text>
        </View>
        <TouchableOpacity
          style={styles.addCategoryBtn}
          onPress={() => Alert.alert('Add Category', 'Opens category creation modal')}
        >
          <Text style={styles.addCategoryText}>+ Add Category</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {categories.map((cat) => {
          const isExp = expanded.includes(cat.id);
          return (
            <View key={cat.id} style={styles.catCard}>
              <View style={styles.catHeader}>
                <TouchableOpacity
                  style={styles.catTitleRow}
                  onPress={() => toggleExpand(cat.id)}
                >
                  <Text style={styles.arrowIcon}>{isExp ? '▼' : '▶'}</Text>
                  <Text style={styles.catName}>{cat.name}</Text>
                </TouchableOpacity>
                <View style={styles.actionIcons}>
                  <TouchableOpacity><Text style={{ fontSize: 16 }}>✏️</Text></TouchableOpacity>
                  <TouchableOpacity><Text style={{ fontSize: 16 }}>🗑️</Text></TouchableOpacity>
                </View>
              </View>

              {isExp && cat.subcategories.length > 0 && (
                <View style={styles.subcatList}>
                  {cat.subcategories.map((sub, idx) => (
                    <View key={idx} style={styles.subcatRow}>
                      <Text style={styles.subcatText}>• {sub}</Text>
                      <View style={styles.subcatActions}>
                        <TouchableOpacity><Text style={{ fontSize: 12 }}>✏️</Text></TouchableOpacity>
                        <TouchableOpacity><Text style={{ fontSize: 12 }}>🗑️</Text></TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
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
  addCategoryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  addCategoryText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  catCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  arrowIcon: {
    fontSize: 12,
    color: colors.primaryDeep,
  },
  catName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  subcatList: {
    marginTop: spacing.sm,
    paddingLeft: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
  subcatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  subcatText: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
  subcatActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
