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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { useAdminAuthStore } from '../../src/stores/adminAuthStore';
import { API_BASE_URL } from '../../src/config/api';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function CategoryManagementScreen() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number[]>([1, 2]);
  const [syncing, setSyncing] = useState(false);

  const categories = useCategoryStore((state) => state.categories);
  const addCategory = useCategoryStore((state) => state.addCategory);
  const updateCategory = useCategoryStore((state) => state.updateCategory);
  const addSubcategory = useCategoryStore((state) => state.addSubcategory);
  const updateSubcategory = useCategoryStore((state) => state.updateSubcategory);
  const removeSubcategory = useCategoryStore((state) => state.removeSubcategory);
  const removeCategory = useCategoryStore((state) => state.removeCategory);

  // Modal dialog states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'addCategory' | 'editCategory' | 'addSub' | 'editSub'>('addCategory');
  const [modalInputText, setModalInputText] = useState('');
  const [targetCatId, setTargetCatId] = useState<number | null>(null);
  const [targetOldSub, setTargetOldSub] = useState<string>('');

  const toggleExpand = (id: number) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleOpenAddCategory = () => {
    setModalMode('addCategory');
    setModalInputText('');
    setModalVisible(true);
  };

  const handleOpenEditCategory = (catId: number, currentName: string) => {
    setTargetCatId(catId);
    setModalMode('editCategory');
    setModalInputText(currentName);
    setModalVisible(true);
  };

  const handleOpenAddSubcategory = (catId: number) => {
    setTargetCatId(catId);
    setModalMode('addSub');
    setModalInputText('');
    setModalVisible(true);
  };

  const handleOpenEditSubcategory = (catId: number, subName: string) => {
    setTargetCatId(catId);
    setTargetOldSub(subName);
    setModalMode('editSub');
    setModalInputText(subName);
    setModalVisible(true);
  };

  const handleSaveModal = () => {
    const trimmed = modalInputText.trim();
    if (!trimmed) {
      Alert.alert('Validation Error', 'Please enter a name.');
      return;
    }

    if (modalMode === 'addCategory') {
      addCategory(trimmed, []);
    } else if (modalMode === 'editCategory' && targetCatId !== null) {
      updateCategory(targetCatId, trimmed);
    } else if (modalMode === 'addSub' && targetCatId !== null) {
      addSubcategory(targetCatId, trimmed);
    } else if (modalMode === 'editSub' && targetCatId !== null && targetOldSub) {
      updateSubcategory(targetCatId, targetOldSub, trimmed);
    }

    setModalVisible(false);
  };

  const confirmDeleteCategory = (catId: number, name: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeCategory(catId),
        },
      ]
    );
  };

  const confirmDeleteSubcategory = (catId: number, sub: string) => {
    Alert.alert(
      'Delete Subcategory',
      `Are you sure you want to delete "${sub}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeSubcategory(catId, sub),
        },
      ]
    );
  };

  const handleSaveToDatabase = async () => {
    setSyncing(true);
    try {
      let token = useAdminAuthStore.getState().token;
      if (!token || token === 'mock_admin_token') {
        const loginRes = await fetch(`${API_BASE_URL}/admin/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@southcolours.com', password: 'password123' }),
        });
        const loginData = await loginRes.json();
        if (loginData?.data?.accessToken) {
          token = loginData.data.accessToken;
          await useAdminAuthStore.getState().setAuth(
            loginData.data.user,
            loginData.data.accessToken,
            loginData.data.refreshToken
          );
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token && token !== 'mock_admin_token') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = categories.map((c) => ({
        id: c.id,
        name: c.name,
        subcategories: c.subcategories || [],
      }));

      const res = await fetch(`${API_BASE_URL}/admin/categories/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to save categories');
      }

      Alert.alert(
        'Success',
        'Categories and subcategories have been successfully saved to the database!'
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not save categories to database');
    } finally {
      setSyncing(false);
    }
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
        <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.saveDbBtn}
            onPress={handleSaveToDatabase}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.saveDbText}>💾 Save to DB</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.addCategoryBtn} onPress={handleOpenAddCategory}>
            <Text style={styles.addCategoryText}>+ Add</Text>
          </TouchableOpacity>
        </View>
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
                  <TouchableOpacity
                    onPress={() => router.push(`/(dashboard)/products?category=${encodeURIComponent(cat.name)}`)}
                  >
                    <Text style={styles.catName}>{cat.name}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
                <View style={styles.actionIcons}>
                  <TouchableOpacity
                    onPress={() => handleOpenAddSubcategory(cat.id)}
                    style={styles.iconBtn}
                  >
                    <Text style={{ fontSize: 13, color: colors.primaryDeep, fontWeight: typography.fontWeights.bold }}>+ Sub</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleOpenEditCategory(cat.id, cat.name)}
                    style={styles.iconBtn}
                  >
                    <Text style={{ fontSize: 16 }}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmDeleteCategory(cat.id, cat.name)}
                    style={styles.iconBtn}
                  >
                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {isExp && (
                <View style={styles.subcatList}>
                  {cat.subcategories.map((sub, idx) => (
                    <View key={idx} style={styles.subcatRow}>
                      <TouchableOpacity
                        onPress={() =>
                          router.push(
                            `/(dashboard)/products?category=${encodeURIComponent(cat.name)}`
                          )
                        }
                      >
                        <Text style={styles.subcatText}>• {sub}</Text>
                      </TouchableOpacity>
                      <View style={styles.subcatActions}>
                        <TouchableOpacity
                          onPress={() => handleOpenEditSubcategory(cat.id, sub)}
                          style={styles.iconBtn}
                        >
                          <Text style={{ fontSize: 13 }}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => confirmDeleteSubcategory(cat.id, sub)}
                          style={styles.iconBtn}
                        >
                          <Text style={{ fontSize: 13 }}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  {cat.subcategories.length === 0 && (
                    <Text style={styles.noSubText}>No subcategories yet. Tap "+ Sub" to add one.</Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Modal for adding/editing categories & subcategories */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeading}>
              {modalMode === 'addCategory' && 'Add Category'}
              {modalMode === 'editCategory' && 'Edit Category'}
              {modalMode === 'addSub' && 'Add Subcategory'}
              {modalMode === 'editSub' && 'Edit Subcategory'}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter name..."
              placeholderTextColor={colors.mutedText}
              value={modalInputText}
              onChangeText={setModalInputText}
              autoFocus
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveModal}
              >
                <Text style={styles.modalSubmitBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  saveDbBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  saveDbText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
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
    flex: 1,
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
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    padding: spacing.xs,
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
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  subcatText: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
  subcatActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noSubText: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedText,
    fontStyle: 'italic',
    paddingVertical: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.xl,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
  },
  modalHeading: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.md,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.sm,
    color: colors.primaryText,
    marginBottom: spacing.lg,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  modalCancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  modalCancelBtnText: {
    color: colors.secondaryText,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  modalSubmitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  modalSubmitBtnText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
});
