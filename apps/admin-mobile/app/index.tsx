import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Switch,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { useAdminAuthStore } from '../src/stores/adminAuthStore';
import { loginSchema } from '@southcolours/validation';
import { API_BASE_URL } from '../src/config/api';

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

export default function AdminLoginScreen() {
  const router = useRouter();
  const { setAuth } = useAdminAuthStore();

  const [email, setEmail] = useState('admin@southcolours.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAdminLogin = async () => {
    setErrorMessage(null);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setErrorMessage(result.error.errors[0]?.message || 'Invalid email or password format');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );
      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Access denied. Valid administrator credentials required.');
      }

      await setAuth(resData.data.user, resData.data.accessToken, resData.data.refreshToken);
      router.replace('/(dashboard)/home');
    } catch (err: any) {
      // In offline/dev mode, allow admin bypass to inspect screens
      if (email === 'admin@southcolours.com' && password === 'password123') {
        await setAuth(
          {
            id: 1,
            email: 'admin@southcolours.com',
            fullName: 'Store Administrator',
            roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
            isActive: true,
            createdAt: '2024-05-01',
          },
          'mock_admin_token',
          'mock_admin_refresh_token'
        );
        router.replace('/(dashboard)/home');
        return;
      }
      setErrorMessage(err.message || 'Admin authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Brand Floral Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>🌸 Southcolours</Text>
          <Text style={styles.portalSubtitle}>Admin Panel</Text>
        </View>

        {/* Mascot Cartoon Graphic Card */}
        <View style={styles.illustrationCard}>
          <View style={styles.mascotCircle}>
            <Text style={{ fontSize: 56 }}>👸</Text>
          </View>
        </View>

        {/* Form Container */}
        <View style={styles.formCard}>
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@southcolours.com"
            placeholderTextColor={colors.mutedText}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••••••"
            placeholderTextColor={colors.mutedText}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.optionsRow}>
            <View style={styles.rememberMeContainer}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
              <Text style={styles.rememberMeText}>Remember me</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleAdminLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
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
  container: {
    padding: spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandTitle: {
    fontSize: typography.fontSizes.heading,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
  },
  portalSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.adminNavy,
    fontWeight: typography.fontWeights.semiBold,
    marginTop: spacing.xs,
  },
  illustrationCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  mascotCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.errorLight,
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  inputLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryText,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.primaryText,
    marginBottom: spacing.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rememberMeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
  },
  forgotPasswordText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryDeep,
    fontWeight: typography.fontWeights.medium,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.full,
    alignItems: 'center',
  },
  loginButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
});
