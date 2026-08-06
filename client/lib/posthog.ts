import PostHog from 'posthog-react-native'
import { useSubscriptionStore } from './SubscriptionStore'

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST

const missingConfiguration = !projectToken || !host

if (__DEV__ && !projectToken) {
  console.warn(
    'EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN is configured',
  )
}

if (__DEV__ && !host) {
  console.warn(
    'EXPO_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once EXPO_PUBLIC_POSTHOG_HOST is configured',
  )
}

export const posthog = missingConfiguration
  ? undefined
  : new PostHog(projectToken, {
      host,
      captureAppLifecycleEvents: true,
      defaultOptIn: false,
      errorTracking: {
        autocapture: {
          uncaughtExceptions: true,
          unhandledRejections: true,
          console: false,
        },
      },
    })

if (posthog) {
  const initialConsent = useSubscriptionStore.getState().analyticsConsent;
  if (initialConsent) {
    posthog.optIn();
  } else {
    posthog.optOut();
  }

  let lastConsent = initialConsent;
  useSubscriptionStore.subscribe((state) => {
    if (state.analyticsConsent !== lastConsent) {
      lastConsent = state.analyticsConsent;
      if (lastConsent) {
        posthog.optIn();
      } else {
        posthog.optOut();
      }
    }
  });
}
