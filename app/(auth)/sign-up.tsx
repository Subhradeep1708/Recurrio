import { Link } from 'expo-router';
import { styled } from 'nativewind';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const SignUp = () => {
  return (
    <SafeAreaView>
      <Text>SignUp</Text>
        <Link href="/(auth)/sign-up">Create Account</Link>
    </SafeAreaView>
  )
}

export default SignUp