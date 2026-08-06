import { useSignIn } from '@clerk/expo';
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

import { getAuthErrorMessage, normalizeEmail, validateConfirmationCode, validateEmail, validateSignInPassword } from '@/lib/auth';
import { authInputStyle } from '@/constants/theme';
import { useSubscriptionStore } from '@/lib/SubscriptionStore';

const SafeAreaView = styled(RNSafeAreaView);

const SignIn = () => {
  const router = useRouter();
  const posthog = usePostHog();
  const { signIn, fetchStatus } = useSignIn();
  const { analyticsConsent } = useSubscriptionStore();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const isSubmitting = fetchStatus === 'fetching';

  const navigateToApp = () => {
    router.replace('/(tabs)');
  };

  const finalizeSession = async () => {
    try {
      await signIn?.finalize({
        navigate: ({ session }) => {
          if (session?.user?.id && analyticsConsent) {
            posthog?.identify(session.user.id);
            posthog?.capture('user_signed_in');
          }

          if (session?.currentTask) {
            router.replace('/onboarding');
            return;
          }

          navigateToApp();
        },
      });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  const handleSignIn = async () => {
    if (!signIn) {
      return;
    }

    const emailError = validateEmail(emailAddress);
    if (emailError) {
      setErrorMessage(emailError);
      return;
    }

    const passwordError = validateSignInPassword(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    setErrorMessage('');
    setInfoMessage('');

    const { error } = await signIn.password({
      emailAddress: normalizeEmail(emailAddress),
      password,
    });

    if (error) {
      setErrorMessage(getAuthErrorMessage(error));
      return;
    }

    if (signIn.status === 'complete') {
      await finalizeSession();
      return;
    }

    if (signIn.status === 'needs_client_trust') {
      const { error: sendError } = await signIn.mfa.sendEmailCode();
      if (sendError) {
        setErrorMessage(getAuthErrorMessage(sendError));
        return;
      }

      setInfoMessage(`We sent a verification code to ${normalizeEmail(emailAddress)}.`);
      setIsVerifying(true);
      return;
    }

    if (signIn.status === 'needs_second_factor') {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === 'email_code',
      );

      if (!emailCodeFactor) {
        setErrorMessage('Additional verification is required for this account.');
        return;
      }

      const { error: sendError } = await signIn.mfa.sendEmailCode();
      if (sendError) {
        setErrorMessage(getAuthErrorMessage(sendError));
        return;
      }

      setInfoMessage(`We sent a verification code to ${normalizeEmail(emailAddress)}.`);
      setIsVerifying(true);
      return;
    }

    setErrorMessage('Sign in is not complete. Please try again.');
  };

  const handleVerify = async () => {
    if (!signIn) {
      return;
    }

    const codeError = validateConfirmationCode(emailCode);
    if (codeError) {
      setErrorMessage(codeError);
      return;
    }

    setErrorMessage('');

    const { error } = await signIn.mfa.verifyEmailCode({ code: emailCode });

    if (error) {
      setErrorMessage(getAuthErrorMessage(error));
      return;
    }

    if (signIn.status === 'complete') {
      await finalizeSession();
      return;
    }

    setErrorMessage('Verification is not complete. Please try again.');
  };

  const resendCode = async () => {
    if (!signIn) {
      return;
    }

    setErrorMessage('');
    const { error } = await signIn.mfa.sendEmailCode();
    if (error) {
      setErrorMessage(getAuthErrorMessage(error));
      return;
    }

    setInfoMessage('A fresh code has been sent.');
  };

  if (!signIn) {
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
              Welcome back
            </Text>
            <Text className="auth-subtitle">
              Sign in to manage your subscriptions, billing reminders, and renewals from one place.
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
                    value={emailCode}
                    onChangeText={(value) => {
                      setEmailCode(value.replace(/\s+/g, ''));
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter the 6-digit code"
                    placeholderTextColor="rgba(8,17,38,0.45)"
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                  />
                </View>

                {errorMessage ? (
                  <Text
                    className="auth-error"
                    accessibilityLiveRegion="assertive"
                    accessibilityRole="alert"
                  >
                    {errorMessage}
                  </Text>
                ) : null}
                {infoMessage ? (
                  <Text
                    className="auth-helper"
                    accessibilityLiveRegion="polite"
                  >
                    {infoMessage}
                  </Text>
                ) : null}

                <Pressable
                  onPress={handleVerify}
                  disabled={isSubmitting}
                  className={isSubmitting ? 'auth-button auth-button-disabled' : 'auth-button'}
                  accessibilityRole="button"
                  accessibilityLabel="Verify and continue"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff9e3" />
                  ) : (
                    <Text className="auth-button-text">Verify and continue</Text>
                  )}
                </Pressable>

                <View className="auth-divider-row">
                  <View className="auth-divider-line" />
                  <Text className="auth-divider-text">Or</Text>
                  <View className="auth-divider-line" />
                </View>

                <Pressable
                  onPress={resendCode}
                  className="auth-secondary-button"
                  accessibilityRole="button"
                  accessibilityLabel="Send me another code"
                >
                  <Text className="auth-secondary-button-text">Send me another code</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setIsVerifying(false);
                    setEmailCode('');
                    setErrorMessage('');
                    setInfoMessage('');
                    signIn.reset();
                  }}
                  className="items-center"
                  accessibilityRole="button"
                  accessibilityLabel="Use a different account"
                >
                  <Text className="auth-link">Use a different account</Text>
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

                    <Pressable 
                      onPress={() => setShowPassword((current) => !current)}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    >
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
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(8,17,38,0.45)"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    textContentType="password"
                    autoComplete="password"
                  />
                </View>

                {errorMessage ? (
                  <Text 
                    className="auth-error"
                    accessibilityLiveRegion="assertive"
                    accessibilityRole="alert"
                  >
                    {errorMessage}
                  </Text>
                ) : null}
                {infoMessage ? (
                  <Text 
                    className="auth-helper"
                    accessibilityLiveRegion="polite"
                  >
                    {infoMessage}
                  </Text>
                ) : null}

                <Pressable
                  onPress={handleSignIn}
                  disabled={isSubmitting}
                  className={isSubmitting ? 'auth-button auth-button-disabled' : 'auth-button'}
                  accessibilityRole="button"
                  accessibilityLabel="Sign in"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff9e3" />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>

                <View className="auth-divider-row">
                  <View className="auth-divider-line" />
                  <Text className="auth-divider-text">Secure sign-in</Text>
                  <View className="auth-divider-line" />
                </View>

                <View className="auth-link-row">
                  <Text className="auth-link-copy">New to Recurrio?</Text>
                  <Pressable 
                    onPress={() => router.push('/(auth)/sign-up')}
                    accessibilityRole="button"
                    accessibilityLabel="Create a new Recurrio account"
                  >
                    <Text className="auth-link">Create an account</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default SignIn