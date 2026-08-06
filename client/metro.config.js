const { getPostHogExpoConfig } = require("posthog-react-native/metro");
// NOTE: We are pinning and utilizing nativewind@5.0.0-preview.4 because it provides Expo v54 support.
// We accept any associated preview risk for this styling dependency.
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getPostHogExpoConfig(__dirname);

module.exports = withNativewind(config);