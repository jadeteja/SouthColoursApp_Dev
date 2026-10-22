import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { useCategoryStore } from '../../src/stores/categoryStore';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function AddEditProductScreen() {
  const router = useRouter();
  const categoryList = useCategoryStore((state) => state.categories);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  // Modal selector states
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subCategoryModalVisible, setSubCategoryModalVisible] = useState(false);

  // Available subcategories for the current selected category
  const activeCategoryObj = categoryList.find(
    (c) => c.name.toLowerCase() === category.toLowerCase()
  );
  const availableSubcategories = activeCategoryObj?.subcategories || [];

  const handleSelectCategory = (catName: string) => {
    setCategory(catName);
    setCategoryModalVisible(false);
    // Find subcategories for newly selected category and pick the first one if available
    const newCatObj = categoryList.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    if (newCatObj && newCatObj.subcategories.length > 0) {
      setSubcategory(newCatObj.subcategories[0]);
    } else {
      setSubcategory('');
    }
  };

  const handleSelectSubCategory = (subCatName: string) => {
    setSubcategory(subCatName);
    setSubCategoryModalVisible(false);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera roll / photo library permissions are needed to choose product photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((a) => a.uri);
        setImages((prev) => [...prev, ...newUris]);
      }
    } catch (err: any) {
      Alert.alert('Image Selection Error', err?.message || 'Could not pick image.');
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a product name.');
      return;
    }
    Alert.alert('Product Saved', `Successfully updated ${name} in store catalog.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenHeading}>Add New Product</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>Product Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => setCategoryModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={category ? styles.dropdownText : styles.dropdownPlaceholder}>
                {category || 'Select Category'}
              </Text>
              <Text style={styles.dropdownArrow}>▾</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Sub Category *</Text>
            <TouchableOpacity
              style={[
                styles.dropdownBtn,
                availableSubcategories.length === 0 && styles.dropdownBtnDisabled,
              ]}
              onPress={() => {
                if (availableSubcategories.length > 0) {
                  setSubCategoryModalVisible(true);
                } else {
                  Alert.alert('No Subcategories', `Please select a category or configure subcategories for ${category} in Settings.`);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={subcategory ? styles.dropdownText : styles.dropdownPlaceholder}>
                {subcategory || (availableSubcategories.length > 0 ? 'Select Subcategory' : 'None')}
              </Text>
              <Text style={styles.dropdownArrow}>▾</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Price (₹) *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Discount Price (₹)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={discountPrice}
              onChangeText={setDiscountPrice}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>SKU *</Text>
            <TextInput style={styles.input} value={sku} onChangeText={setSku} />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Stock Quantity *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={stock}
              onChangeText={setStock}
            />
          </View>
        </View>

        {/* Size Checkboxes */}
        <Text style={styles.label}>Size Options</Text>
        <View style={styles.sizeOptionsRow}>
          {['1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-8Y'].map((s) => {
            const active = selectedSizes.includes(s);
            return (
              <TouchableOpacity
                key={s}
                style={[styles.sizeBox, active && styles.sizeBoxActive]}
                onPress={() => toggleSize(s)}
              >
                <Text style={[styles.sizeBoxText, active && styles.sizeBoxTextActive]}>
                  {active ? '☑' : '☐'} {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Product Images Selector */}
        <Text style={styles.label}>Product Images</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagesRow}>
          {images.map((uri, idx) => (
            <View key={idx} style={styles.imagePreview}>
              <Image source={{ uri }} style={styles.previewImg} />
              <TouchableOpacity
                style={styles.removeImgBtn}
                onPress={() => removeImage(idx)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.removeImgBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImage} activeOpacity={0.7}>
            <Text style={{ fontSize: 24, color: colors.primaryDeep }}>+</Text>
            <Text style={{ fontSize: 10, color: colors.primaryDeep, fontWeight: typography.fontWeights.medium }}>
              Add Images
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Dropdown Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categoryList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = item.name.toLowerCase() === category.toLowerCase();
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                    onPress={() => handleSelectCategory(item.name)}
                  >
                    <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                      {item.name}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Subcategory Dropdown Modal */}
      <Modal
        visible={subCategoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSubCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSubCategoryModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sub Category ({category})</Text>
              <TouchableOpacity onPress={() => setSubCategoryModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableSubcategories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = item.toLowerCase() === subcategory.toLowerCase();
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                    onPress={() => handleSelectSubCategory(item)}
                  >
                    <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                      {item}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: statusBarHeight,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  screenHeading: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  formContainer: {
    padding: spacing.xl,
    paddingBottom: 60,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.primaryText,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.sm,
    color: colors.primaryText,
    backgroundColor: colors.white,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  sizeOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sizeBox: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
  },
  sizeBoxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  sizeBoxText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  sizeBoxTextActive: {
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
  },
  imagePreview: {
    width: 76,
    height: 76,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'visible',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    borderRadius: radii.md,
    resizeMode: 'cover',
  },
  removeImgBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  removeImgBtnText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },
  addImageBtn: {
    width: 76,
    height: 76,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.secondaryText,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
  },
  saveBtnText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    minHeight: 44,
  },
  dropdownBtnDisabled: {
    backgroundColor: colors.primarySoft,
    opacity: 0.7,
  },
  dropdownText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryText,
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedText,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 14,
    color: colors.secondaryText,
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  modalCloseText: {
    fontSize: 18,
    color: colors.secondaryText,
    padding: spacing.xs,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemSelected: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
  },
  modalItemText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryText,
  },
  modalItemTextSelected: {
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
  checkmark: {
    fontSize: 16,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
});
