const { getPostHogExpoConfig } = require("posthog-react-native/metro");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getPostHogExpoConfig(__dirname);

module.exports = withNativewind(config);