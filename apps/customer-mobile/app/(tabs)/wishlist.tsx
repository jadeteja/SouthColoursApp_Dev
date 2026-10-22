import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar as RNStatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function WishlistScreen() {
  const router = useRouter();

  const wishlistItems = [
    { id: 1, name: 'Pink Lehenga Set', price: 2499, originalPrice: 3499, rating: 4.8 },
    { id: 2, name: 'Yellow Anarkali', price: 1899, originalPrice: 2499, rating: 4.9 },
    { id: 3, name: 'Purple Lehenga', price: 2299, originalPrice: 2999, rating: 4.7 },
  ];

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist ({wishlistItems.length})</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {wishlistItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push(`/product/${item.id}`)}
            >
              <View style={styles.thumb}>
                <Text style={{ fontSize: 40 }}>👗</Text>
                <View style={styles.heartBtn}><Text>❤️</Text></View>
              </View>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹ {item.price}</Text>
                  <Text style={styles.originalPrice}>₹ {item.originalPrice}</Text>
                </View>
                <TouchableOpacity style={styles.moveBtn} onPress={() => router.push('/(tabs)/cart')}>
                  <Text style={styles.moveBtnText}>Move to Cart</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: statusBarHeight },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  content: { padding: spacing.md, paddingBottom: 80 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  thumb: {
    height: 160,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heartBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { padding: spacing.sm },
  name: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primaryText,
    marginBottom: 4,
  },
  priceRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', marginBottom: spacing.xs },
  price: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.bold, color: colors.primaryDeep },
  originalPrice: { fontSize: typography.fontSizes.xs, color: colors.mutedText, textDecorationLine: 'line-through' },
  moveBtn: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    borderRadius: radii.full,
    alignItems: 'center',
    marginTop: 4,
  },
  moveBtnText: {
    color: colors.primaryDeep,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
});
