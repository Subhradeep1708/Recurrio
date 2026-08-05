import { useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { styled } from 'nativewind';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

import {
  getAuthErrorMessage,
  normalizeEmail,
  passwordRequirements,
  validateConfirmationCode,
  validateEmail,
  validatePassword,
} from '@/lib/auth';

const SafeAreaView = styled(RNSafeAreaView);
const authInputStyle = {
  paddingHorizontal: 14,
  paddingVertical: 12,
  minHeight: 58,
  textAlignVertical: 'center' as const,
};

const SignUp = () => {
  const router = useRouter();
  const posthog = usePostHog();
  const { signUp, fetchStatus } = useSignUp();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const isSubmitting = fetchStatus === 'fetching';

  const navigateToApp = () => {
    router.replace('/(tabs)');
  };

  const finalizeSession = async () => {
    await signUp?.finalize({
      navigate: ({ session }) => {
        if (session?.userId) {
          posthog?.identify(session.userId);
          posthog?.capture('account_created');
        }

        if (session?.currentTask) {
          router.replace('/onboarding');
          return;
        }

        navigateToApp();
      },
    });
  };

  const handleCreateAccount = async () => {
    if (!signUp) {
      return;
    }

    const emailError = validateEmail(emailAddress);
    if (emailError) {
      setErrorMessage(emailError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setErrorMessage('');
    setInfoMessage('');

    const { error } = await signUp.password({
      emailAddress: normalizeEmail(emailAddress),
      password,
    });

    if (error) {
      setErrorMessage(getAuthErrorMessage(error));
      return;
    }

    const sendCodeResult = await signUp.verifications.sendEmailCode();
    if (sendCodeResult?.error) {
      setErrorMessage(getAuthErrorMessage(sendCodeResult.error));
      return;
    }

    setVerificationCode('');
    setIsVerifying(true);
    setInfoMessage(`We sent a verification code to ${normalizeEmail(emailAddress)}.`);
  };

  const handleVerify = async () => {
    if (!signUp) {
      return;
    }

    const codeError = validateConfirmationCode(verificationCode);
    if (codeError) {
      setErrorMessage(codeError);
      return;
    }

    setErrorMessage('');

    const { error } = await signUp.verifications.verifyEmailCode({ code: verificationCode });

    if (error) {
      setErrorMessage(getAuthErrorMessage(error));
      return;
    }

    if (signUp.status === 'complete') {
      await finalizeSession();
      return;
    }

    setErrorMessage('Verification is not complete. Please try again.');
  };

  const resendCode = async () => {
    if (!signUp) {
      return;
    }

    setErrorMessage('');
    const sendCodeResult = await signUp.verifications.sendEmailCode();
    if (sendCodeResult?.error) {
      setErrorMessage(getAuthErrorMessage(sendCodeResult.error));
      return;
    }

    setInfoMessage('A fresh verification code has been sent.');
  };

  const restartFlow = () => {
    signUp?.reset();
    setEmailAddress('');
    setPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsVerifying(false);
    setErrorMessage('');
    setInfoMessage('');
  };

  if (!signUp) {
    return null;
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>

              <View>
                <Text className="auth-wordmark">Recurrio</Text>
                <Text className="auth-wordmark-sub">Smart billing</Text>
              </View>
            </View>

            <Text className="auth-title text-center">
              Create your account
            </Text>
            <Text className="auth-subtitle">
              Start tracking renewals, budgets, and billing reminders with a secure, guided setup.
            </Text>
          </View>

          <View className="auth-card">
            {isVerifying ? (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className="auth-input"
                    style={authInputStyle}
                    value={verificationCode}
                    onChangeText={(value) => {
                      setVerificationCode(value.replace(/\s+/g, ''));
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter the 6-digit code"
                    placeholderTextColor="rgba(8,17,38,0.45)"
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                  />
                </View>

                {errorMessage ? <Text className="auth-error">{errorMessage}</Text> : null}
                {infoMessage ? <Text className="auth-helper">{infoMessage}</Text> : null}

                <Pressable
                  onPress={handleVerify}
                  disabled={isSubmitting}
                  className={isSubmitting ? 'auth-button auth-button-disabled' : 'auth-button'}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff9e3" />
                  ) : (
                    <Text className="auth-button-text">Verify and finish</Text>
                  )}
                </Pressable>

                <View className="auth-divider-row">
                  <View className="auth-divider-line" />
                  <Text className="auth-divider-text">Or</Text>
                  <View className="auth-divider-line" />
                </View>

                <Pressable onPress={resendCode} className="auth-secondary-button">
                  <Text className="auth-secondary-button-text">Send me another code</Text>
                </Pressable>

                <Pressable onPress={restartFlow} className="items-center">
                  <Text className="auth-link">Use a different email</Text>
                </Pressable>
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className="auth-input"
                    style={authInputStyle}
                    value={emailAddress}
                    onChangeText={(value) => {
                      setEmailAddress(value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(8,17,38,0.45)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                  />
                </View>

                <View className="auth-field">
                  <View className="flex-row items-center justify-between">
                    <Text className="auth-label">Password</Text>

                    <Pressable onPress={() => setShowPassword((current) => !current)}>
                      <Text className="auth-link">{showPassword ? 'Hide' : 'Show'}</Text>
                    </Pressable>
                  </View>

                  <TextInput
                    className="auth-input"
                    style={authInputStyle}
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Create a password"
                    placeholderTextColor="rgba(8,17,38,0.45)"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    textContentType="newPassword"
                    autoComplete="password-new"
                  />
                </View>

                <View className="auth-field">
                  <View className="flex-row items-center justify-between">
                    <Text className="auth-label">Confirm password</Text>

                    <Pressable onPress={() => setShowConfirmPassword((current) => !current)}>
                      <Text className="auth-link">{showConfirmPassword ? 'Hide' : 'Show'}</Text>
                    </Pressable>
                  </View>

                  <TextInput
                    className="auth-input"
                    style={authInputStyle}
                    value={confirmPassword}
                    onChangeText={(value) => {
                      setConfirmPassword(value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Repeat your password"
                    placeholderTextColor="rgba(8,17,38,0.45)"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    textContentType="newPassword"
                    autoComplete="password-new"
                  />
                </View>

                <View className="gap-2 rounded-2xl bg-background px-4 py-3">
                  {passwordRequirements.map((requirement) => (
                    <Text key={requirement} className="text-sm font-sans-medium text-foreground/60">
                      • {requirement}
                    </Text>
                  ))}
                </View>

                {errorMessage ? <Text className="auth-error">{errorMessage}</Text> : null}
                {infoMessage ? <Text className="auth-helper">{infoMessage}</Text> : null}

                <Pressable
                  onPress={handleCreateAccount}
                  disabled={isSubmitting}
                  className={isSubmitting ? 'auth-button auth-button-disabled' : 'auth-button'}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff9e3" />
                  ) : (
                    <Text className="auth-button-text">Create account</Text>
                  )}
                </Pressable>

                {/* <View className="auth-divider-row">
                  <View className="auth-divider-line" />
                  <Text className="auth-divider-text">Protected by Clerk</Text>
                  <View className="auth-divider-line" />
                </View> */}

                <View className="auth-link-row">
                  <Text className="auth-link-copy">Already have an account?</Text>
                  <Pressable onPress={() => router.push('/(auth)/sign-in')}>
                    <Text className="auth-link">Sign in</Text>
                  </Pressable>
                </View>

                <View nativeID="clerk-captcha" />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default SignUp