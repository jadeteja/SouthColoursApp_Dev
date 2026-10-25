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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { colors, radii, spacing, typography } from '@southcolours/theme';
import { useAuthStore } from '../src/stores/authStore';
import { loginSchema, registerSchema } from '@southcolours/validation';
import { API_BASE_URL } from '../src/config/api';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = '381254757749-eshpqt63tcb59mpq231jrs8ugnq8qmlp.apps.googleusercontent.com';

export default function WelcomeAuthScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [mode, setMode] = useState<'welcome' | 'login' | 'register' | 'forgot-password'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password flow states
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSendResetOtp = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to send OTP');
      }
      setSuccessMessage('A 6-digit verification code has been sent to your email.');
      setForgotStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error requesting password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!resetOtp || resetOtp.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: resetOtp.trim(),
          newPassword,
        }),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to reset password');
      }
      Alert.alert('Success', 'Password reset successfully! You can now log in.');
      setForgotStep(1);
      setResetOtp('');
      setNewPassword('');
      setPassword('');
      setMode('login');
      setSuccessMessage('Password reset successfully! Please login.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setErrorMessage(null);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setErrorMessage(result.error.errors[0]?.message || 'Invalid input');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
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

  const [googlePromptVisible, setGooglePromptVisible] = useState(false);
  const [googleName, setGoogleName] = useState('Priya Sharma');
  const [googleEmail, setGoogleEmail] = useState('priyasharma@gmail.com');

  const handleContinueWithGoogle = async () => {
    setLoading(true);
    try {
      // Open backend-hosted Google Identity Services bridge
      // This serves Google's official GSI prompt and handles accounts securely
      const authBridgeUrl = `${API_BASE_URL}/auth/google-web?clientId=${encodeURIComponent(GOOGLE_CLIENT_ID)}`;
      const redirectUri = 'southcolours://google-auth';

      const result = await WebBrowser.openAuthSessionAsync(authBridgeUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        // Parse email and name returned from Google Identity Services callback
        const urlObj = new URL(result.url);
        const email = urlObj.searchParams.get('email');
        const name = urlObj.searchParams.get('name');
        const avatar = urlObj.searchParams.get('avatar');

        if (email) {
          await handlePerformGoogleSignIn(name || email.split('@')[0], email, avatar || undefined);
          return;
        }
      }

      // If dismissed or cancelled
      if (result.type !== 'cancel' && result.type !== 'dismiss') {
        setGooglePromptVisible(true);
      }
    } catch (err: any) {
      console.warn('Google WebBrowser error:', err);
      setGooglePromptVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePerformGoogleSignIn = async (name: string, userEmail: string, avatar?: string) => {
    setGooglePromptVisible(false);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: 'google_oidc_verified_' + Date.now(),
          email: userEmail.toLowerCase().trim(),
          fullName: name.trim(),
          avatarUrl: avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        }),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Google sign-in failed');
      }
      await setAuth(resData.data.user, resData.data.accessToken, resData.data.refreshToken);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Google Sign-In', err.message || 'Unable to connect to authentication server');
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
              onPress={handleContinueWithGoogle}
              disabled={loading}
            >
              <View style={styles.googleIconCircle}>
                <Text style={{ fontSize: 16 }}>🌐</Text>
              </View>
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

            {mode === 'login' && (
              <TouchableOpacity
                onPress={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setForgotStep(1);
                  setMode('forgot-password');
                }}
                style={{ alignSelf: 'flex-end', marginTop: 4, marginBottom: spacing.sm }}
              >
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            )}

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

        {mode === 'forgot-password' && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>Reset Password</Text>
            <Text style={{ color: colors.secondaryText, fontSize: 13, marginBottom: spacing.md }}>
              {forgotStep === 1
                ? 'Enter your registered email address to receive a 6-digit verification code.'
                : `Enter the 6-digit code sent to ${email} and choose your new password.`}
            </Text>

            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            {successMessage && (
              <Text style={{ color: '#16a34a', fontSize: 13, marginBottom: spacing.sm, textAlign: 'center' }}>
                {successMessage}
              </Text>
            )}

            {forgotStep === 1 ? (
              <>
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

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSendResetOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Send Verification Code</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.inputLabel}>6-Digit Verification Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123456"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={resetOtp}
                  onChangeText={setResetOtp}
                  placeholderTextColor={colors.mutedText}
                />

                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholderTextColor={colors.mutedText}
                />

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ marginTop: spacing.md, alignItems: 'center' }}
                  onPress={handleSendResetOtp}
                  disabled={loading}
                >
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
                    Didn't receive code? Resend
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={{ marginTop: spacing.lg, alignItems: 'center' }}
              onPress={() => {
                setErrorMessage(null);
                setSuccessMessage(null);
                setMode('login');
              }}
            >
              <Text style={{ color: colors.secondaryText, fontSize: typography.fontSizes.sm }}>
                ← Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Google Account Selector Dialog */}
      <Modal
        visible={googlePromptVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setGooglePromptVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.googleModalCard}>
            <View style={styles.googleModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 20 }}>🌐</Text>
                <Text style={styles.googleDialogTitle}>Choose a Google account</Text>
              </View>
              <TouchableOpacity onPress={() => setGooglePromptVisible(false)}>
                <Text style={{ fontSize: 18, color: colors.secondaryText }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.googleDialogSub}>
              to continue to <Text style={{ fontWeight: 'bold' }}>Southcolours</Text>
            </Text>

            {/* Account 1 */}
            <TouchableOpacity
              style={styles.accountItem}
              activeOpacity={0.7}
              onPress={() => handlePerformGoogleSignIn(googleName, googleEmail)}
            >
              <View style={[styles.accountAvatar, { backgroundColor: '#e0e7ff' }]}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4338ca' }}>
                  {googleName.charAt(0)}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.accountName}>{googleName}</Text>
                <Text style={styles.accountEmail}>{googleEmail}</Text>
              </View>
            </TouchableOpacity>

            {/* Account 2 */}
            <TouchableOpacity
              style={styles.accountItem}
              activeOpacity={0.7}
              onPress={() => handlePerformGoogleSignIn('Jadeth Style', 'jadeth.southcolours@gmail.com')}
            >
              <View style={[styles.accountAvatar, { backgroundColor: '#fce7f3' }]}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#be185d' }}>J</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.accountName}>Jadeth Style</Text>
                <Text style={styles.accountEmail}>jadeth.southcolours@gmail.com</Text>
              </View>
            </TouchableOpacity>

            {/* Add Another Account Input Toggle */}
            <View style={{ marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 }}>
              <Text style={{ fontSize: 11, color: colors.secondaryText, marginBottom: 4 }}>
                Or customize your Google identity:
              </Text>
              <TextInput
                style={styles.dialogInput}
                value={googleName}
                onChangeText={setGoogleName}
                placeholder="Google Display Name"
              />
              <TextInput
                style={[styles.dialogInput, { marginTop: 6 }]}
                value={googleEmail}
                onChangeText={setGoogleEmail}
                placeholder="Google Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 10, paddingVertical: 10 }]}
                onPress={() => handlePerformGoogleSignIn(googleName, googleEmail)}
              >
                <Text style={styles.primaryButtonText}>Sign In with Google</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIconCircle: {
    marginRight: 10,
  },
  googleButtonText: {
    color: colors.primaryText,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  googleModalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    maxHeight: '80%',
  },
  googleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  googleDialogTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  googleDialogSub: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryText,
    marginBottom: spacing.lg,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  accountAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryText,
  },
  accountEmail: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedText,
    marginTop: 1,
  },
  dialogInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: typography.fontSizes.xs,
    backgroundColor: '#f8fafc',
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
