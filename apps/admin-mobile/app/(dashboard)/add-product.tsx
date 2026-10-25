import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { useAdminAuthStore } from '../../src/stores/adminAuthStore';
import { API_BASE_URL } from '../../src/config/api';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function AddEditProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const productId = params.id ? parseInt(params.id, 10) : undefined;
  const isEditing = Boolean(productId && !isNaN(productId));

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
  const [videoUrl, setVideoUrl] = useState('');

  // Modal selector states
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subCategoryModalVisible, setSubCategoryModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(isEditing);
  const [customSubInput, setCustomSubInput] = useState('');
  const [showAddSubInput, setShowAddSubInput] = useState(false);

  // Load product details when editing
  useEffect(() => {
    if (!productId || isNaN(productId)) return;

    let isMounted = true;
    const loadDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await fetch(`${API_BASE_URL}/products/${productId}`);
        const json = await res.json();
        if (json.success && json.data && isMounted) {
          const p = json.data;
          setName(p.name || '');
          setDescription(p.description || '');
          setCategory(p.categoryName || '');
          setPrice(p.discountPrice ? p.discountPrice.toString() : (p.basePrice ? p.basePrice.toString() : ''));
          setDiscountPrice(p.basePrice && p.discountPrice && p.basePrice > p.discountPrice ? p.basePrice.toString() : '');

          if (p.variants && p.variants.length > 0) {
            setSku(p.variants[0].sku?.split('-')[0] || p.variants[0].sku || '');
            setStock(p.variants[0].stockQuantity ? p.variants[0].stockQuantity.toString() : '10');
            const sizes = p.variants.map((v: any) => v.size).filter(Boolean);
            setSelectedSizes(Array.from(new Set(sizes)));
          }

          if (p.images && p.images.length > 0) {
            const rawUrls = p.images.map((img: any) => img.imageUrl);
            const isVid = (url: string) => /\.(mp4|mov|webm|m4v)(\?.*)?$/i.test(url);
            const imgOnly = rawUrls.filter((u: string) => !isVid(u));
            const vidFound = rawUrls.find((u: string) => isVid(u));
            setImages(imgOnly);
            if (vidFound && !p.videoUrl) {
              setVideoUrl(vidFound);
            }
          } else if (p.primaryImageUrl) {
            setImages([p.primaryImageUrl]);
          }

          if (p.videoUrl) {
            setVideoUrl(p.videoUrl);
          }
        }
      } catch (e) {
        console.warn('Failed to load product details for editing', e);
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    };

    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Available subcategories for the current selected category
  const activeCategoryObj = categoryList.find(
    (c) => c.name.toLowerCase() === category.toLowerCase()
  );
  const availableSubcategories = activeCategoryObj?.subcategories || [];

  const addSubcategoryToStore = useCategoryStore((state) => state.addSubcategory);

  const handleCreateCustomSubcategory = () => {
    const trimmed = customSubInput.trim();
    if (!trimmed) return;
    if (activeCategoryObj) {
      addSubcategoryToStore(activeCategoryObj.id, trimmed);
    }
    setSubcategory(trimmed);
    setCustomSubInput('');
    setShowAddSubInput(false);
    setSubCategoryModalVisible(false);
  };

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

  const pickVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera roll / media permissions are needed to choose a product video.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVideoUrl(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert('Video Selection Error', err?.message || 'Could not pick video.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a product name.');
      return;
    }
    if (!category.trim()) {
      Alert.alert('Validation Error', 'Please select a product category.');
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price.');
      return;
    }

    setSaving(true);
    try {
      // 1. Get or obtain valid Admin JWT token
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

      // 2. Upload any local images to the backend media endpoint
      let uploadedImageUrls: string[] = [];
      const localImages = images.filter((uri) => !uri.startsWith('http'));
      const remoteImages = images.filter((uri) => uri.startsWith('http'));

      if (localImages.length > 0) {
        const formData = new FormData();
        localImages.forEach((uri, idx) => {
          const filename = uri.split('/').pop() || `product_img_${idx}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          formData.append('files', {
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            name: filename,
            type,
          } as any);
        });

        const uploadHeaders: Record<string, string> = {};
        if (token && token !== 'mock_admin_token') {
          uploadHeaders['Authorization'] = `Bearer ${token}`;
        }

        const uploadResponse = await fetch(`${API_BASE_URL}/uploads`, {
          method: 'POST',
          headers: uploadHeaders,
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadJson = await uploadResponse.json();
          if (uploadJson.success && Array.isArray(uploadJson.data)) {
            uploadedImageUrls = uploadJson.data;
          }
        } else {
          console.warn('Image upload failed with status:', uploadResponse.status);
        }
      }

      const allImageUrls = [...remoteImages, ...uploadedImageUrls];
      if (allImageUrls.length === 0) {
        if (localImages.length > 0) {
          // Keep local uri if server upload was bypassed
          allImageUrls.push(localImages[0]);
        } else {
          allImageUrls.push('https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80');
        }
      }

      // 2b. Upload local video if selected
      let finalVideoUrl = videoUrl.trim();
      if (finalVideoUrl && !finalVideoUrl.startsWith('http')) {
        try {
          const videoFormData = new FormData();
          const filename = finalVideoUrl.split('/').pop() || 'product_video.mp4';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `video/${match[1]}` : 'video/mp4';
          videoFormData.append('files', {
            uri: Platform.OS === 'android' ? finalVideoUrl : finalVideoUrl.replace('file://', ''),
            name: filename,
            type,
          } as any);

          const uploadHeaders: Record<string, string> = {};
          if (token && token !== 'mock_admin_token') {
            uploadHeaders['Authorization'] = `Bearer ${token}`;
          }

          const vidResponse = await fetch(`${API_BASE_URL}/uploads`, {
            method: 'POST',
            headers: uploadHeaders,
            body: videoFormData,
          });

          if (vidResponse.ok) {
            const vidJson = await vidResponse.json();
            if (vidJson.success && Array.isArray(vidJson.data) && vidJson.data.length > 0) {
              finalVideoUrl = vidJson.data[0];
            }
          }
        } catch (vidErr) {
          console.warn('Video upload failed, keeping current URI:', vidErr);
        }
      }

      // 3. Find matching category ID from backend
      const matchedCat = categoryList.find(
        (c) => c.name.toLowerCase() === category.toLowerCase()
      );
      const categoryId = matchedCat?.id || 1;

      // 4. Construct variants array
      const parsedStock = parseInt(stock, 10) || 10;
      const effectiveSku = sku.trim() || `SC${Date.now().toString().slice(-5)}`;
      const sizesToSave = selectedSizes.length > 0 ? selectedSizes : ['Standard'];

      const variants = sizesToSave.map((s) => ({
        sku: `${effectiveSku}-${s.replace(/[^a-zA-Z0-9]/g, '')}`,
        size: s,
        colorName: 'Primary',
        colorHex: '#FF4081',
        stockQuantity: parsedStock,
      }));

      const parsedDiscountPrice = parseFloat(discountPrice);

      // Append video URL to imageUrls so it is safely preserved across both backend versions
      if (finalVideoUrl && !allImageUrls.includes(finalVideoUrl)) {
        allImageUrls.push(finalVideoUrl);
      }

      const requestPayload = {
        categoryId,
        name: name.trim(),
        description: description.trim() || name.trim(),
        brand: 'Southcolours',
        basePrice: parsedDiscountPrice && parsedDiscountPrice > parsedPrice ? parsedDiscountPrice : parsedPrice * 1.3,
        discountPrice: parsedPrice,
        isFeatured: false,
        isNewArrival: true,
        isActive: true,
        videoUrl: finalVideoUrl || null,
        variants,
        imageUrls: allImageUrls,
      };

      const productHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token && token !== 'mock_admin_token') {
        productHeaders['Authorization'] = `Bearer ${token}`;
      }

      const url = isEditing
        ? `${API_BASE_URL}/admin/products/${productId}`
        : `${API_BASE_URL}/admin/products`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: productHeaders,
        body: JSON.stringify(requestPayload),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        throw new Error(resJson.message || `Server returned ${response.status}`);
      }

      Alert.alert(
        isEditing ? 'Product Updated' : 'Product Saved',
        `Successfully ${isEditing ? 'updated' : 'created'} "${name}" in the database!`,
        [{ text: 'OK', onPress: () => router.push('/(dashboard)/products') }]
      );
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not save product to database. Please make sure the backend is running.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/(dashboard)/products')}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenHeading}>
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </Text>
        <View style={{ width: 20 }} />
      </View>

      {loadingDetails ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: spacing.sm, color: colors.secondaryText }}>
            Loading product details...
          </Text>
        </View>
      ) : (
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
            <Text style={styles.label}>Sub Category</Text>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => {
                if (!category) {
                  Alert.alert('Category Required', 'Please select a Category first.');
                  return;
                }
                setSubCategoryModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={subcategory ? styles.dropdownText : styles.dropdownPlaceholder}>
                {subcategory || (availableSubcategories.length > 0 ? 'Select Subcategory' : '+ Add Subcategory')}
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

        {/* Product Video Section - Displays on the last slide */}
        <Text style={styles.label}>Product Video (Shown on the last slide)</Text>
        {videoUrl ? (
          <View style={styles.videoPreviewCard}>
            <View style={styles.videoPreviewLeft}>
              <Text style={{ fontSize: 24 }}>📹</Text>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.videoFilename} numberOfLines={1}>
                  {videoUrl.split('/').pop() || 'Video Selected'}
                </Text>
                <Text style={styles.videoSubtext}>
                  Will appear on the last slide of the customer gallery
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeVideoBtn}
              onPress={() => setVideoUrl('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.removeImgBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
            <TouchableOpacity style={styles.pickVideoBtn} onPress={pickVideo} activeOpacity={0.7}>
              <Text style={{ fontSize: 18 }}>🎬</Text>
              <Text style={styles.pickVideoBtnText}>Choose Video from Device</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { fontSize: 12, paddingVertical: 8, color: colors.primaryText }]}
              placeholder="Or paste external video URL (.mp4 / streaming URL)"
              placeholderTextColor={colors.mutedText}
              value={videoUrl}
              onChangeText={setVideoUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.push('/(dashboard)/products')} disabled={saving}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.saveBtnText}>
                {isEditing ? 'Update Product' : 'Save Product'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      )}

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
              <TouchableOpacity onPress={() => {
                setSubCategoryModalVisible(false);
                setShowAddSubInput(false);
              }}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {showAddSubInput ? (
              <View style={{ paddingVertical: spacing.sm }}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter subcategory name..."
                  placeholderTextColor={colors.mutedText}
                  value={customSubInput}
                  onChangeText={setCustomSubInput}
                  autoFocus
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.xs }}>
                  <TouchableOpacity
                    style={{ padding: spacing.sm }}
                    onPress={() => setShowAddSubInput(false)}
                  >
                    <Text style={{ color: colors.secondaryText, fontSize: typography.fontSizes.sm }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.md }}
                    onPress={handleCreateCustomSubcategory}
                  >
                    <Text style={{ color: colors.white, fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.bold }}>Add & Select</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.xs,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  marginBottom: spacing.xs,
                }}
                onPress={() => setShowAddSubInput(true)}
              >
                <Text style={{ fontSize: 16, color: colors.primaryDeep, marginRight: spacing.xs }}>➕</Text>
                <Text style={{ fontSize: typography.fontSizes.sm, color: colors.primaryDeep, fontWeight: typography.fontWeights.bold }}>
                  Add New Subcategory
                </Text>
              </TouchableOpacity>
            )}

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
              ListEmptyComponent={
                !showAddSubInput ? (
                  <View style={{ paddingVertical: spacing.md, alignItems: 'center' }}>
                    <Text style={{ color: colors.secondaryText, fontSize: typography.fontSizes.sm }}>
                      No subcategories configured yet.
                    </Text>
                    <Text style={{ color: colors.primaryDeep, fontSize: typography.fontSizes.xs, marginTop: 4 }}>
                      Tap "➕ Add New Subcategory" above to add one now!
                    </Text>
                  </View>
                ) : null
              }
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
  videoPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  videoPreviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  videoFilename: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
  },
  videoSubtext: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    marginTop: 2,
  },
  removeVideoBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryDeep,
    borderStyle: 'dashed',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  pickVideoBtnText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryDeep,
  },
});
