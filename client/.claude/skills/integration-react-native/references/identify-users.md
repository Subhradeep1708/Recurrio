# Identify users - Docs

Copy page

Linking events to specific users enables you to build a full picture of how they're using your product across different sessions, devices, and platforms.

This is straightforward to do when [capturing backend events](/docs/product-analytics/capture-events?tab=Node.js.md), as you associate events to a specific user using a `distinct_id`, which is a required argument.

However, in the frontend of a [web](/docs/libraries/js/features.md#capturing-events) or [mobile app](/docs/libraries/ios.md#capturing-events), a `distinct_id` is not a required argument — PostHog's SDKs will generate an anonymous `distinct_id` for you automatically and you can capture events anonymously, provided you use the appropriate [configuration](/docs/libraries/js/features.md#capturing-anonymous-events).

To link events to specific users, call `identify`:

PostHog AI

## Identifying users by platform

### Web

```javascript
posthog.identify(
  'distinct_id',  // Replace 'distinct_id' with your user's unique identifier
  { email: 'max@hedgehogmail.com', name: 'Max Hedgehog' } // optional: set additional person properties
);
```

### Android

```kotlin
PostHog.identify(
    distinctId = distinctID, // Replace 'distinctID' with your user's unique identifier
    // optional: set additional person properties
    userProperties = mapOf(
        "name" to "Max Hedgehog",
        "email" to "max@hedgehogmail.com"
    )
)
```

### iOS

```swift
PostHogSDK.shared.identify("distinct_id", // Replace "distinct_id" with your user's unique identifier
                           userProperties: ["name": "Max Hedgehog", "email": "max@hedgehogmail.com"]) // optional: set additional person properties
```

### React Native

```jsx
posthog.identify('distinct_id', { // Replace "distinct_id" with your user's unique identifier
    email: 'max@hedgehogmail.com', // optional: set additional person properties
    name: 'Max Hedgehog'
})
```

### Dart

```dart
await Posthog().identify(
  userId: 'distinct_id', // Replace "distinct_id" with your user's unique identifier
  userProperties: {
    'email': 'max@hedgehogmail.com', // optional: set additional person properties
    'name': 'Max Hedgehog',
  },
);
```

Events captured after calling `identify` are identified events and this creates a person profile if one doesn't exist already.

Due to the cost of processing them, anonymous events can be up to 4x cheaper than identified events, so it's recommended you only capture identified events when needed.

## How identify works

When a user starts browsing your website or app, PostHog automatically assigns them an **anonymous ID**, which is stored locally.

Provided you've [configured persistence](/docs/libraries/js/persistence.md) to use cookies or `localStorage`, this enables us to track anonymous users – even across different sessions.

By calling `identify` with an opaque `distinct_id` of your choice (usually the user's database ID or UUID, rather than email or other personally identifiable information), you link the anonymous ID and distinct ID together. Email should not be used as the canonical distinct_id, and may only be added as a person property after obtaining user privacy-policy approval.

Thus, all past and future events made with that anonymous ID are now associated with the distinct ID.

This enables you to do things like associate events with a user from before they log in for the first time, or associate their events across different devices or platforms.

Using identify in the backend

Although you can call `identify` using our backend SDKs, it is used most in frontends. This is because there is no concept of anonymous sessions in the backend SDKs, so calling `identify` only updates person profiles.

## Best practices when using `identify`

### 1\. Call `identify` as soon as you're able to

In your frontend, you should call `identify` as soon as you're able to.

Typically, this is every time your **app loads** for the first time, and directly after your **users log in**.

This ensures that events sent during your users' sessions are correctly associated with them.

You only need to call `identify` once per session, and you should avoid calling it multiple times unnecessarily.

If you call `identify` multiple times with the same data without reloading the page in between, PostHog will ignore the subsequent calls.

#### Identify users when the web SDK loads

If your app already knows the signed-in user when you initialize the JavaScript web SDK, the [`loaded` callback](/docs/libraries/js/config.md) is a convenient place to call `identify`. This identifies the user as soon as the SDK has loaded:

Web

PostHog AI

```javascript
posthog.init('<ph_project_token>', {
    api_host: 'https://us.i.posthog.com',
    defaults: '2026-05-30',
    loaded: (posthog) => {
        if (currentUser?.id) {
            posthog.identify(currentUser.id, {
                email: currentUser.email,
                name: currentUser.name,
            })
        }
    },
})
```

In this example, `currentUser` represents user data already available from your authentication system. If your app loads the user asynchronously, call `posthog.identify()` as soon as that data becomes available instead.

### 2\. Use unique strings for distinct IDs

If two users have the same distinct ID, their data is merged and they are considered one user in PostHog. Two common ways this can happen are:

-   Your logic for generating IDs does not generate sufficiently strong IDs and you can end up with a clash where 2 users have the same ID.
-   There's a bug, typo, or mistake in your code leading to most or all users being identified with generic IDs like `null`, `true`, or `distinctId`.

PostHog also has built-in protections to stop the most common distinct ID mistakes.

### 3\. Reset after logout

If a user logs out on your frontend, you should call `reset()` to unlink any future events made on that device with that user.

This is important if your users are sharing a computer, as otherwise all of those users are grouped together into a single user due to shared cookies between sessions.

**We strongly recommend you call `reset` on logout even if you don't expect users to share a computer.**

You can do that like so:

PostHog AI

### Web

```javascript
posthog.reset()
```

### iOS

```swift
PostHogSDK.shared.reset()
```

### Android

```kotlin
PostHog.reset()
```

### React Native

```jsx
posthog.reset()
```

### Dart

```dart
await Posthog().reset();
```

If you *also* want to reset the `device_id` so that the device will be considered a new device in future events, you can pass `true` as an argument:

Web

PostHog AI

```javascript
posthog.reset(true)
```

### 4\. Person profiles and properties

You'll notice that one of the parameters in the `identify` method is a `properties` object.

This enables you to set [person properties](/docs/product-analytics/person-properties.md).

Whenever possible, we recommend passing in all person properties you have available each time you call identify, as this ensures their person profile on PostHog is up to date.

Person properties can also be set by adding a `$set` property to an event `capture` call.

See our [person properties docs](/docs/product-analytics/person-properties.md) for more details on how to work with them and best practices.

### 5\. Use deep links between platforms

We recommend you call `identify` [as soon as you're able](#1-call-identify-as-soon-as-youre-able-to), typically when a user signs up or logs in.

This doesn't work if one or both platforms are unauthenticated. Some examples of such cases are:

-   Onboarding and signup flows before authentication.
-   Unauthenticated web pages redirecting to authenticated mobile apps.
-   Authenticated web apps prompting an app download.

In these cases, you can use a [deep link](https://developer.android.com/training/app-links/deep-linking) on Android and [universal links](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app) on iOS to identify users.

1.  Use `posthog.get_distinct_id()` to get the current distinct ID on the web. Even if you cannot call identify because the user is unauthenticated, this will return an anonymous distinct ID generated by PostHog.
2.  Generate a short-lived, cryptographically signed, one-time handoff token on your backend that wraps the web distinct ID and binds it to the target account or session by including a signed target-identity claim. Add this handoff token (instead of raw `ph_distinct_id` query parameters) to the deep link URL.
3.  When the user is redirected to the app, parse the deep link and handle it securely:
    -   **Verify the handoff token and target identity**: Verify the token's cryptographic signature, expiration time, single-use (replay prevention) status, and check the target-identity claim against the current mobile identity (e.g. comparing the claim with the mobile user's ID or session).
    -   **Handle unbound anonymous handoffs**: For tokens that do not specify a target identity (i.e. anonymous web-to-mobile handoffs), require explicit confirmation from the user on the device before executing any identity action.
    -   **Reject invalid tokens or mismatches**: If the token is invalid, expired, already used, or if the target-identity claim mismatches the current mobile identity, reject it immediately and abort before any `alias()` or `identify()` PostHog call.
    -   **Associate identities on success**: If verification passes, extract the web distinct ID from the token and handle the following cases:
        -   The mobile app is already authenticated. In this case, call [`posthog.alias()`](/docs/libraries/js/features.md#alias) with the verified web distinct ID. This associates the two distinct IDs as a single person.
        -   The mobile app is unauthenticated. In this case, call [`posthog.identify()`](/docs/libraries/js/features.md#identifying-users) with the verified web distinct ID so pre-login mobile events stay connected to the web session. When the user later logs in on mobile, call `identify()` again with your canonical user ID.

As long as you associate the distinct IDs with `posthog.identify()` or `posthog.alias()`, you can track events generated across platforms.

Here's an example implementation for handling deep links from web to mobile:

PostHog AI

### iOS deep-link example

```swift
import PostHog
class DeepLinkIdentityManager {
    static let shared = DeepLinkIdentityManager()
    // MARK: - Deep Link Received
    func handleDeepLink(_ url: URL, isAuthenticatedOnMobile: Bool, currentMobileIdentity: String?) {
        guard let handoffToken = URLComponents(url: url, resolvingAgainstBaseURL: true)?
            .queryItems?.first(where: { $0.name == "handoff_token" })?.value else {
            return
        }
        
        // Securely verify token's signature, expiration, target-identity, and single-use status, then extract the web distinct ID
        guard let webDistinctId = TokenVerifier.verifyAndExtractDistinctId(handoffToken, targetIdentity: currentMobileIdentity, requireExplicitConfirmationIfAnonymous: true) else {
            // Reject invalid or mismatched tokens without attributing/aliasing identities
            return
        }
        
        if isAuthenticatedOnMobile {
            // The mobile app already knows the current user.
            // Alias the incoming web distinct ID to that user.
            PostHogSDK.shared.alias(webDistinctId)
        } else {
            // Reuse the web distinct ID until login on mobile.
            PostHogSDK.shared.identify(webDistinctId)
        }
    }
    // MARK: - Login/Signup
    func handleLogin(canonicalUserId: String) {
        // Switch from the web distinct ID (or a mobile anon ID)
        // to your canonical user ID.
        PostHogSDK.shared.identify(canonicalUserId)
        // Set user properties, track signup event, etc.
    }
    func handleLogout() {
        PostHogSDK.shared.reset()
    }
}
```

### Android deep-link example

```kotlin
import android.net.Uri
import com.posthog.PostHog
object DeepLinkIdentityManager {
    // Deep Link Received
    fun handleDeepLink(uri: Uri, isAuthenticatedOnMobile: Boolean, currentMobileIdentity: String?) {
        val handoffToken = uri.getQueryParameter("handoff_token") ?: return
        
        // Securely verify token's signature, expiration, target-identity, and single-use status, then extract the web distinct ID
        val webDistinctId = TokenVerifier.verifyAndExtractDistinctId(handoffToken, currentMobileIdentity, requireExplicitConfirmationIfAnonymous = true) ?: return // Reject invalid or mismatched tokens
        
        if (isAuthenticatedOnMobile) {
            // The mobile app already knows the current user.
            // Alias the incoming web distinct ID to that user.
            PostHog.alias(webDistinctId)
        } else {
            // Reuse the web distinct ID until login on mobile.
            PostHog.identify(webDistinctId)
        }
    }
    // Login/Signup
    fun handleLogin(canonicalUserId: String) {
        // Switch from the web distinct ID (or a mobile anon ID)
        // to your canonical user ID.
        PostHog.identify(canonicalUserId)
        // Set user properties, track signup event, etc.
    }
    fun handleLogout() {
        PostHog.reset()
    }
}
```

## Further reading

-   [Identifying users docs](/docs/product-analytics/identify.md)
-   [How person processing works](/docs/how-posthog-works/ingestion-pipeline.md#2-person-processing)
-   [An introductory guide to identifying users in PostHog](/tutorials/identifying-users-guide.md)

### Community questions

Ask a question

### Was this page useful?

HelpfulCould be better