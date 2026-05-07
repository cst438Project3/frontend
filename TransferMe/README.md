# TransferMe Frontend

Expo frontend for TransferMe.

## Google OAuth2 Flow

This branch now matches the backend's Supabase-backed Google auth flow:

1. the app opens Google sign-in with Expo Auth Session
2. Google returns an `id_token` on the client
3. the app posts that token to `POST /api/auth/google/exchange`
4. the backend returns a Supabase access token and refresh token
5. the app stores the session locally and calls backend APIs with `Authorization: Bearer <supabase-jwt>`

The frontend also restores saved sessions on launch and refreshes them through `POST /api/auth/refresh` when needed.

## Required Env Vars

Set these before running the app:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

Notes:

- `EXPO_PUBLIC_API_BASE_URL` should point at the backend repo running on its `google-oauth2` branch.
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` is a useful fallback when you do not yet have separate native client IDs configured.
- the app uses the `transferme://oauthredirect` redirect scheme on native.

## Run

```bash
npm install
npx expo start
```

## Current Scope

Wired up:

- Google sign-in
- backend token exchange
- session restore and refresh
- protected landing routes
- logout

Still stubbed:

- email/password auth
- GitHub auth
- profile save/update wiring
