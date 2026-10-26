import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar as RNStatusBar,
  Modal,
  PanResponder,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { API_BASE_URL } from '../../src/config/api';
import { useWishlistStore } from '../../src/stores/wishlistStore';
import { useCartStore } from '../../src/stores/cartStore';
import { useAuthStore } from '../../src/stores/authStore';
import { QuickPhoneOtpModal } from '../../src/components/QuickPhoneOtpModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

interface ProductDetail {
  id: number;
  name: string;
  categoryName?: string;
  description?: string;
  basePrice: number;
  discountPrice: number;
  discountPercentage?: number;
  averageRating: number;
  reviewCount: number;
  primaryImageUrl?: string;
  videoUrl?: string;
  images?: { id: number; imageUrl: string }[];
  variants?: {
    id: number;
    size: string;
    colorName: string;
    colorHex: string;
    stockQuantity: number;
  }[];
}

const SIZE_CHART_DATA = [
  { size: '1-2Y', chest: '20"', waist: '19"', length: '22"', shoulder: '8.5"' },
  { size: '2-3Y', chest: '22"', waist: '21"', length: '25"', shoulder: '9.0"' },
  { size: '3-4Y', chest: '24"', waist: '22"', length: '28"', shoulder: '9.5"' },
  { size: '4-5Y', chest: '25"', waist: '23"', length: '31"', shoulder: '10.0"' },
  { size: '5-6Y', chest: '26"', waist: '24"', length: '34"', shoulder: '10.5"' },
  { size: '6-8Y', chest: '28"', waist: '26"', length: '38"', shoulder: '11.5"' },
];

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { addItem: addToCartStore, getTotalItems } = useCartStore();

  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const isWishlisted = product ? isInWishlist(product.id) : false;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<Video>(null);

  // Fullscreen Zoom & Size Chart Modals
  const [fullScreenModalVisible, setFullScreenModalVisible] = useState(false);
  const [sizeChartModalVisible, setSizeChartModalVisible] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // Gesture Pinch-to-zoom & Pan with fingers
  const scale = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const currentScale = useRef(1);
  const currentPan = useRef({ x: 0, y: 0 });
  const initialDistance = useRef<number | null>(null);
  const lastTapTime = useRef<number>(0);

  const getDistance = (touches: any[]) => {
    const [t1, t2] = touches;
    const dx = t1.pageX - t2.pageX;
    const dy = t1.pageY - t2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const resetZoom = () => {
    currentScale.current = 1;
    currentPan.current = { x: 0, y: 0 };
    setZoomScale(1);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }),
    ]).start();
  };

  const setManualZoom = (targetScale: number) => {
    currentScale.current = targetScale;
    setZoomScale(targetScale);
    if (targetScale === 1) {
      currentPan.current = { x: 0, y: 0 };
      Animated.parallel([
        Animated.spring(scale, { toValue: targetScale, useNativeDriver: true }),
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.spring(scale, { toValue: targetScale, useNativeDriver: true }).start();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const now = Date.now();
        // Double-tap to quick zoom in (2.5x) or reset to 1x
        if (now - lastTapTime.current < 300) {
          if (currentScale.current > 1) {
            resetZoom();
          } else {
            setManualZoom(2.5);
          }
        }
        lastTapTime.current = now;

        if (evt.nativeEvent.touches.length === 2) {
          initialDistance.current = getDistance(evt.nativeEvent.touches);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        // Two-finger pinch or drag-to-zoom
        if (evt.nativeEvent.touches.length === 2) {
          const distance = getDistance(evt.nativeEvent.touches);
          if (initialDistance.current !== null && initialDistance.current > 0) {
            const factor = distance / initialDistance.current;
            const newScale = Math.min(Math.max(currentScale.current * factor, 1), 6);
            scale.setValue(newScale);
            setZoomScale(+newScale.toFixed(1));
          }
        } else if (evt.nativeEvent.touches.length === 1) {
          // Drag & pan across any direction freely
          const newX = currentPan.current.x + gestureState.dx;
          const newY = currentPan.current.y + gestureState.dy;
          pan.setValue({ x: newX, y: newY });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        initialDistance.current = null;
        if (evt.nativeEvent.touches.length === 0) {
          // @ts-ignore
          const val = scale._value || currentScale.current;
          currentScale.current = Math.min(Math.max(val, 1), 6);
          setZoomScale(+currentScale.current.toFixed(1));

          // Save pan offset
          currentPan.current.x += gestureState.dx;
          currentPan.current.y += gestureState.dy;

          if (currentScale.current <= 1) {
            // Keep centered when scale returns to 1x
            resetZoom();
          }
        }
      },
    })
  ).current;

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          const p = json.data;
          setProduct(p);

          // Preselect first size if available
          if (p.variants && p.variants.length > 0) {
            setSelectedSize(p.variants[0].size || 'Standard');
          }
        }
      } catch (err) {
        console.warn('Failed to fetch product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const productThumbnail =
    (product?.images && product.images.length > 0
      ? product.images.find((img) => !/\.(mp4|mov|webm|m4v)(\?.*)?$/i.test(img.imageUrl))?.imageUrl || product.images[0].imageUrl
      : product?.primaryImageUrl) || '';

  const handleAddToCart = () => {
    if (!product) return;
    const finalSize = selectedSize || 'Standard';
    addToCartStore({
      productId: product.id,
      name: product.name,
      size: finalSize,
      price: product.discountPrice || product.basePrice,
      originalPrice: product.basePrice,
      imageUrl: productThumbnail,
      quantity,
    });

    Alert.alert(
      'Added to Cart',
      `${product.name} (Size: ${finalSize}, Qty: ${quantity}) added to your shopping cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'Go to Cart', onPress: () => router.push('/(tabs)/cart') },
      ]
    );
  };

  const handleBuyNow = () => {
    if (!product) return;
    const finalSize = selectedSize || 'Standard';
    addToCartStore({
      productId: product.id,
      name: product.name,
      size: finalSize,
      price: product.discountPrice || product.basePrice,
      originalPrice: product.basePrice,
      imageUrl: productThumbnail,
      quantity,
    });

    if (!user) {
      setOtpModalVisible(true);
      return;
    }
    router.push('/checkout');
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.sm, color: colors.secondaryText }}>Loading product...</Text>
      </View>
    );
  }

  const isVideoUrl = (url: string) => /\.(mp4|mov|webm|m4v)(\?.*)?$/i.test(url);
  const rawImages =
    product?.images && product.images.length > 0
      ? product.images.map((img) => img.imageUrl)
      : product?.primaryImageUrl
      ? [product.primaryImageUrl]
      : [];

  const imageUris = rawImages.filter((url) => !isVideoUrl(url));
  const videoUris = [
    ...rawImages.filter((url) => isVideoUrl(url)),
    ...(product?.videoUrl ? [product.videoUrl] : []),
  ];
  const uniqueVideos = Array.from(new Set(videoUris.filter(Boolean)));

  // Put product images first, and the product video in the LAST SLIDE
  const mediaSlides: { type: 'image' | 'video'; uri: string }[] = [
    ...imageUris.map((uri) => ({ type: 'image' as const, uri })),
    ...uniqueVideos.map((uri) => ({ type: 'video' as const, uri })),
  ];

  const primaryCoverImage = imageUris[0] || product?.primaryImageUrl || '';

  const uniqueSizes = Array.from(
    new Set((product?.variants || []).map((v) => v.size).filter(Boolean))
  );

  return (
    <View style={styles.safeArea}>
      {/* Top Header - Fixed and clear of Status Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: colors.primaryText }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product?.name || 'Product Details'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => {
              if (product) {
                toggleItem({
                  id: product.id,
                  name: product.name,
                  price: product.discountPrice || product.basePrice,
                  originalPrice: product.basePrice,
                  imageUrl: primaryCoverImage,
                  rating: product.averageRating,
                  reviewCount: product.reviewCount,
                });
              }
            }}
            style={styles.headerActionBtn}
          >
            <Text style={{ fontSize: 20 }}>{isWishlisted ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn} onPress={() => router.push('/(tabs)/cart')}>
            <Text style={{ fontSize: 20 }}>🛍️</Text>
            {getTotalItems() > 0 && (
              <View style={styles.headerCartBadge}>
                <Text style={styles.headerCartBadgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Large Product Gallery Carousel - Images first, Video in Last Slide */}
        {mediaSlides.length > 0 ? (
          <View style={styles.imageGallery}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const offset = e.nativeEvent.contentOffset.x;
                const index = Math.round(offset / SCREEN_WIDTH);
                if (index !== activeImageIndex) {
                  setActiveImageIndex(index);
                }
              }}
              scrollEventThrottle={16}
            >
              {mediaSlides.map((item, idx) => (
                <View key={idx} style={{ width: SCREEN_WIDTH, height: 400 }}>
                  {item.type === 'video' ? (
                    <View style={styles.videoContainer}>
                      <Video
                        ref={videoRef}
                        source={{ uri: item.uri }}
                        style={styles.videoPlayer}
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping
                        isMuted={isMuted}
                        shouldPlay={activeImageIndex === idx && isPlaying}
                        useNativeControls={false}
                      />

                      {/* Video Badge */}
                      <View style={styles.videoBadge}>
                        <Text style={{ fontSize: 12 }}>📹</Text>
                        <Text style={styles.videoBadgeText}>Product Video</Text>
                      </View>

                      {/* Center Play button overlay if paused */}
                      {!isPlaying && activeImageIndex === idx && (
                        <TouchableOpacity
                          style={styles.videoCenterPlayBtn}
                          onPress={() => setIsPlaying(true)}
                          activeOpacity={0.8}
                        >
                          <Text style={{ fontSize: 28, color: colors.white, marginLeft: 4 }}>▶</Text>
                        </TouchableOpacity>
                      )}

                      {/* Video Quick Controls: Mute & Play/Pause */}
                      <View style={styles.videoControlsOverlay}>
                        <TouchableOpacity
                          style={styles.videoControlBtn}
                          onPress={() => setIsMuted((prev) => !prev)}
                          activeOpacity={0.8}
                        >
                          <Text style={{ fontSize: 16 }}>{isMuted ? '🔇' : '🔊'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.videoControlBtn}
                          onPress={() => setIsPlaying((prev) => !prev)}
                          activeOpacity={0.8}
                        >
                          <Text style={{ fontSize: 16 }}>{isPlaying ? '⏸' : '▶'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.95}
                      onPress={() => setFullScreenModalVisible(true)}
                      style={{ width: SCREEN_WIDTH, height: 400 }}
                    >
                      <Image source={{ uri: item.uri }} style={styles.galleryImg} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Tap to Zoom or Fullscreen Pill */}
            <TouchableOpacity
              style={styles.zoomPill}
              onPress={() => setFullScreenModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.zoomPillText}>
                {mediaSlides[activeImageIndex]?.type === 'video'
                  ? '⛶ Fullscreen Video'
                  : '🔍 Tap to zoom'}
              </Text>
            </TouchableOpacity>

            {/* Carousel Dots - Last Slide Video Indicator */}
            {mediaSlides.length > 1 && (
              <View style={styles.dotsRow}>
                {mediaSlides.map((item, idx) => {
                  const isActive = idx === activeImageIndex;
                  const isVideo = item.type === 'video';
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.dot,
                        isActive && styles.dotActive,
                        isVideo && styles.videoDot,
                        isVideo && isActive && styles.videoDotActive,
                      ]}
                    >
                      {isVideo ? (
                        <Text style={[styles.videoDotIcon, isActive && { color: colors.white }]}>
                          ▶
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={{ fontSize: 80 }}>👗</Text>
          </View>
        )}

        {/* Product Details Section */}
        <View style={styles.detailsCard}>
          <Text style={styles.productTitle}>{product?.name}</Text>
          <Text style={styles.categorySub}>{product?.categoryName}</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingStars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.reviewsText}>
              ({product?.reviewCount || 24} reviews)
            </Text>
          </View>

          {/* Pricing Strip */}
          <View style={styles.pricingStrip}>
            <Text style={styles.sellingPrice}>₹ {product?.discountPrice}</Text>
            {product?.basePrice && product.basePrice > product.discountPrice && (
              <>
                <Text style={styles.originalPrice}>₹ {product.basePrice}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>
                    {Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>

          {product?.description ? (
            <Text style={styles.description}>{product.description}</Text>
          ) : null}

          {/* Size Selection with Size Chart Button */}
          {uniqueSizes.length > 0 && (
            <View style={styles.selectorSection}>
              <View style={styles.selectorHeader}>
                <Text style={styles.selectorTitle}>Size Options</Text>
                <TouchableOpacity
                  onPress={() => setSizeChartModalVisible(true)}
                  style={styles.sizeGuideBtn}
                >
                  <Text style={styles.sizeGuideLink}>📏 Size Chart</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chipsRow}>
                {uniqueSizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[styles.sizeChip, selectedSize === size && styles.sizeChipActive]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[styles.sizeChipText, selectedSize === size && styles.sizeChipTextActive]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity Stepper */}
          <View style={styles.selectorSection}>
            <Text style={styles.selectorTitle}>Quantity</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Sticky Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {/* Fullscreen Zoomable Image Modal */}
      <Modal
        visible={fullScreenModalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => {
          setZoomScale(1);
          setFullScreenModalVisible(false);
        }}
      >
        <View style={styles.fullScreenContainer}>
          <View style={styles.fullScreenHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={styles.fullScreenIndex}>
                {activeImageIndex + 1} / {mediaSlides.length}
              </Text>
              {mediaSlides[activeImageIndex]?.type === 'video' ? (
                <View style={[styles.zoomLevelBadge, { backgroundColor: colors.primaryDeep }]}>
                  <Text style={{ color: colors.white, fontSize: 10, fontWeight: 'bold' }}>📹 Video</Text>
                </View>
              ) : (
                <Text style={styles.zoomLevelBadge}>{Math.round(zoomScale * 100)}%</Text>
              )}
            </View>

            {/* Zoom Control Buttons: Reset, Zoom Out, Zoom In, and Close */}
            <View style={styles.zoomButtonsRow}>
              {mediaSlides[activeImageIndex]?.type !== 'video' && (
                <>
                  <TouchableOpacity
                    onPress={() => setManualZoom(Math.max(1, +(zoomScale - 0.5).toFixed(1)))}
                    style={styles.zoomCtrlBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.zoomCtrlText}>−</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={resetZoom}
                    style={styles.zoomCtrlBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.zoomCtrlText, { fontSize: 11 }]}>1x</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setManualZoom(Math.min(6, +(zoomScale + 0.5).toFixed(1)))}
                    style={styles.zoomCtrlBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.zoomCtrlText}>+</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                onPress={() => {
                  resetZoom();
                  setFullScreenModalVisible(false);
                }}
                style={styles.fullScreenCloseBtn}
              >
                <Text style={styles.fullScreenCloseText}>✕ Close</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Fullscreen Video Player or Pinch-to-zoom Image */}
          {mediaSlides[activeImageIndex]?.type === 'video' ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
              <Video
                source={{ uri: mediaSlides[activeImageIndex].uri }}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.72 }}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                isLooping
                shouldPlay
              />
            </View>
          ) : (
            <View style={styles.gestureContainer} {...panResponder.panHandlers}>
              <Animated.View
                style={[
                  styles.animatedImageWrapper,
                  {
                    transform: [
                      { scale: scale },
                      { translateX: pan.x },
                      { translateY: pan.y },
                    ],
                  },
                ]}
              >
                {mediaSlides[activeImageIndex] && (
                  <Image
                    source={{ uri: mediaSlides[activeImageIndex].uri }}
                    style={styles.zoomableImage}
                  />
                )}
              </Animated.View>
            </View>
          )}

          {/* Thumbnail Strip at Bottom if Multiple Slides */}
          {mediaSlides.length > 1 && (
            <View style={styles.fullScreenThumbStrip}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.md }}>
                {mediaSlides.map((slide, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setActiveImageIndex(idx);
                      setZoomScale(1);
                    }}
                    style={[
                      styles.fullScreenThumb,
                      idx === activeImageIndex && styles.fullScreenThumbActive,
                    ]}
                  >
                    {slide.type === 'video' ? (
                      <View style={{ width: '100%', height: '100%', backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', borderRadius: 4 }}>
                        <Text style={{ fontSize: 13, color: colors.white }}>▶</Text>
                      </View>
                    ) : (
                      <Image source={{ uri: slide.uri }} style={{ width: '100%', height: '100%', borderRadius: 4 }} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>

      {/* Size Chart Modal */}
      <Modal
        visible={sizeChartModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSizeChartModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSizeChartModalVisible(false)}
        >
          <View style={styles.sizeChartCard}>
            <View style={styles.sizeChartHeader}>
              <Text style={styles.sizeChartTitle}>📏 Kids Size Chart (Inches)</Text>
              <TouchableOpacity onPress={() => setSizeChartModalVisible(false)}>
                <Text style={{ fontSize: 18, color: colors.secondaryText, padding: 4 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Size Table */}
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeaderRow]}>
                <Text style={[styles.tableCell, styles.tableHeadText, { flex: 1.2 }]}>Size</Text>
                <Text style={[styles.tableCell, styles.tableHeadText]}>Chest</Text>
                <Text style={[styles.tableCell, styles.tableHeadText]}>Waist</Text>
                <Text style={[styles.tableCell, styles.tableHeadText]}>Length</Text>
                <Text style={[styles.tableCell, styles.tableHeadText]}>Shoulder</Text>
              </View>
              {SIZE_CHART_DATA.map((row, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.tableRow,
                    idx % 2 === 1 && { backgroundColor: '#FDF2F4' },
                    selectedSize === row.size && { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <Text style={[styles.tableCell, { flex: 1.2, fontWeight: 'bold', color: colors.primaryDeep }]}>
                    {row.size}
                  </Text>
                  <Text style={styles.tableCell}>{row.chest}</Text>
                  <Text style={styles.tableCell}>{row.waist}</Text>
                  <Text style={styles.tableCell}>{row.length}</Text>
                  <Text style={styles.tableCell}>{row.shoulder}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sizeChartNote}>
              * Measurements in inches. If between sizes, we recommend choosing one size larger.
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Quick OTP Login Sheet for Buy Now */}
      <QuickPhoneOtpModal
        visible={otpModalVisible}
        onClose={() => setOtpModalVisible(false)}
        onSuccess={() => {
          setOtpModalVisible(false);
          router.push('/checkout');
        }}
        title="Buy Now - Quick Login"
        subtitle="Enter mobile number to verify and proceed directly to delivery & payment"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: statusBarHeight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginHorizontal: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerActionBtn: {
    padding: spacing.xs,
    position: 'relative',
  },
  headerCartBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: colors.primaryDeep,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  headerCartBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingBottom: 110,
  },
  imageGallery: {
    width: SCREEN_WIDTH,
    height: 400,
    backgroundColor: colors.white,
    position: 'relative',
  },
  galleryImg: {
    width: SCREEN_WIDTH,
    height: 400,
    resizeMode: 'contain',
  },
  placeholderBox: {
    width: SCREEN_WIDTH,
    height: 320,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  zoomPillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: typography.fontWeights.semiBold,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primaryDeep,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: 400,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPlayer: {
    width: SCREEN_WIDTH,
    height: 400,
  },
  videoBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    gap: 4,
    zIndex: 5,
  },
  videoBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: typography.fontWeights.semiBold,
  },
  videoCenterPlayBtn: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  videoControlsOverlay: {
    position: 'absolute',
    bottom: 24,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 5,
  },
  videoControlBtn: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDotActive: {
    width: 20,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primaryDeep,
  },
  videoDotIcon: {
    fontSize: 7,
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 1,
  },
  detailsCard: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    marginTop: -16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  productTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  categorySub: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryDeep,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  ratingStars: {
    fontSize: 14,
  },
  reviewsText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
  },
  pricingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sellingPrice: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  originalPrice: {
    fontSize: typography.fontSizes.md,
    color: colors.mutedText,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  discountBadgeText: {
    color: colors.success,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  description: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  selectorSection: {
    marginBottom: spacing.lg,
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  selectorTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  sizeGuideBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
  },
  sizeGuideLink: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sizeChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  sizeChipActive: {
    borderColor: colors.primaryDeep,
    backgroundColor: colors.primarySoft,
  },
  sizeChipText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryText,
  },
  sizeChipTextActive: {
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  stepBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  quantityText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    paddingHorizontal: spacing.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -3 },
  },
  addToCartBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.sm,
  },
  buyNowBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.sm,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: statusBarHeight,
  },
  fullScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 20,
  },
  fullScreenIndex: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  fullScreenCloseBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  fullScreenCloseText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  zoomLevelBadge: {
    color: '#F472B6',
    fontSize: 12,
    fontWeight: typography.fontWeights.bold,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  zoomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  zoomCtrlBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomCtrlText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: typography.fontWeights.bold,
  },
  gestureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  animatedImageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomableImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
    resizeMode: 'contain',
  },
  fullScreenThumbStrip: {
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  fullScreenThumb: {
    width: 50,
    height: 50,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#444',
  },
  fullScreenThumbActive: {
    borderColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sizeChartCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    elevation: 6,
  },
  sizeChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  sizeChartTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: spacing.xs,
  },
  tableHeaderRow: {
    backgroundColor: colors.primarySoft,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: colors.primaryText,
  },
  tableHeadText: {
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  sizeChartNote: {
    fontSize: 11,
    color: colors.secondaryText,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
