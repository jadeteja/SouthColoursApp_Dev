import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { useAuthStore } from '../src/stores/authStore';
import { loginSchema, registerSchema } from '@southcolours/validation';

export default function WelcomeAuthScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [mode, setMode] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setErrorMessage(result.error.errors[0]?.message || 'Invalid input');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Login failed');
      }

      await setAuth(resData.data.user, resData.data.accessToken, resData.data.refreshToken);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to authentication server');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setErrorMessage(null);
    const result = registerSchema.safeParse({ fullName, email, password, phoneNumber });
    if (!result.success) {
      setErrorMessage(result.error.errors[0]?.message || 'Invalid input');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, phoneNumber }),
      });
      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Registration failed');
      }

      await setAuth(resData.data.user, resData.data.accessToken, resData.data.refreshToken);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMock = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: 'google_oidc_token_sample',
          email: 'customer.google@example.com',
          fullName: 'Google User',
        }),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Google login failed');
      }
      await setAuth(resData.data.user, resData.data.accessToken, resData.data.refreshToken);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Google Sign-In', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header Floral Logo */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>🌸 Southcolours</Text>
          <Text style={styles.tagline}>Little Styles, Big Smiles</Text>
        </View>

        {mode === 'welcome' && (
          <View style={styles.content}>
            <View style={styles.heroBox}>
              <View style={styles.mascotCircle}>
                <Text style={{ fontSize: 64 }}>👧</Text>
              </View>
              <Text style={styles.heroTitle}>Trendy & Comfortable Kids Clothing</Text>
              <Text style={styles.heroSubtitle}>
                Dresses, Ethnic Wear, Everyday Outfits and More for Your Little Ones
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={() => router.replace('/(tabs)/home')}
            >
              <Text style={styles.primaryButtonText}>Get Started (Browse as Guest)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
              onPress={() => setMode('login')}
            >
              <Text style={styles.secondaryButtonText}>Login / Sign Up</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or Continue with</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              activeOpacity={0.8}
              onPress={handleGoogleMock}
              disabled={loading}
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        )}

        {(mode === 'login' || mode === 'register') && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>
              {mode === 'login' ? 'Welcome Back!' : 'Create an Account'}
            </Text>

            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

            {mode === 'register' && (
              <>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Priya Sharma"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholderTextColor={colors.mutedText}
                />

                <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholderTextColor={colors.mutedText}
                />
              </>
            )}

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={colors.mutedText}
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={colors.mutedText}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {mode === 'login' ? 'Login' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: spacing.lg, alignItems: 'center' }}
              onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              <Text style={styles.switchModeText}>
                {mode === 'login'
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Login'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: spacing.md, alignItems: 'center' }}
              onPress={() => setMode('welcome')}
            >
              <Text style={{ color: colors.secondaryText, fontSize: typography.fontSizes.sm }}>
                ← Back to Welcome
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  brandTitle: {
    fontSize: typography.fontSizes.heading,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDeep,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
    marginTop: spacing.xs,
  },
  content: {
    alignItems: 'center',
  },
  heroBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xxl,
  },
  mascotCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.full,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  secondaryButton: {
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.lg,
    borderRadius: radii.full,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  secondaryButtonText: {
    color: colors.primaryDeep,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semiBold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    color: colors.mutedText,
    fontSize: typography.fontSizes.xs,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    borderRadius: radii.full,
    width: '100%',
    alignItems: 'center',
  },
  googleButtonText: {
    color: colors.primaryText,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  formContainer: {
    width: '100%',
  },
  formHeading: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryText,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.primaryText,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.md,
  },
  switchModeText: {
    color: colors.primaryDeep,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
  },
});
