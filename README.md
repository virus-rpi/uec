# UEC — Ultimate Email Client (Prototype)

This is a cross‑platform Expo app (Android + Web). On Linux desktop, run the Web build in your browser for a desktop experience.

Primary feature in this prototype: virtual inboxes grouped by the address an email was sent to (useful for users with many alias addresses pointing to one inbox). Future work includes a node‑based editor to map addresses to actual and virtual inboxes.

Theme: black background with white text. Headings use the Bitcount Google Font on the Web target (with graceful fallbacks on Android). Body text still approximates a dotted look via subtle styling.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npm start
   ```

3. Open on your target:
   - Web (Linux desktop): press "w" in the Expo CLI to open in the browser.
   - Android: press "a" for an emulator, or scan the QR code with Expo Go.

The app uses file‑based routing (expo-router). Main screens:
- Virtual Inboxes (app/index.tsx)
- Accounts (add Gmail or manual IMAP/POP/SMTP) (app/accounts.tsx)
- Inbox by address (app/inbox/[address].tsx)
- Message detail (app/mail/[id].tsx)
- Node Editor placeholder (app/editor/index.tsx)

## Accounts: Gmail & Manual IMAP/POP/SMTP

The Accounts screen lets you:
- Sign in with Google and store an OAuth access token (scopes include https://mail.google.com/). The app verifies the token by calling Google userinfo and stores the email when available.
- Add a manual account by entering incoming (IMAP/POP3) and outgoing (SMTP) server settings. These are stored securely using expo-secure-store.

Important: React Native apps cannot directly open IMAP/POP/SMTP sockets without additional native modules or a backend service. This project currently stores settings securely and can verify Google tokens, but it does not yet sync mail. To enable real protocol connectivity, consider:
- Adding a lightweight backend that handles IMAP/POP/SMTP and exposes a REST/WebSocket API to the app; or
- Integrating socket-capable native modules (e.g., react-native-tcp, TLS bindings) and JS protocol clients adapted for RN.

### Configure Google OAuth
1. Create OAuth credentials in Google Cloud Console for your platforms (Web, Android, iOS).
2. Set the app scheme to `uec` (already set in app.json). Add authorized redirect URIs like:
   - Expo proxy: https://auth.expo.dev/@owo.computer/uec
   - Native: uec://redirect
   - Web dev: http://localhost:19006
3. Provide your client IDs in `app/accounts.tsx` inside `Google.useAuthRequest` (iosClientId, androidClientId, webClientId). Alternatively, use environment variables and read them here.
4. Run the app and tap "Sign in with Google" in Accounts.

## Notes about the dotted font
For now, the font is simulated with subtle text shadow and spacing. To achieve a true dotted font, add a dot‑matrix font file under `assets/fonts/` and load it in `app/_layout.tsx` using `useFonts`, then apply it in a shared ThemedText component.

## Scripts
- `npm start` — start the dev server
- `npm run web` — start the web target directly
- `npm run android` — start the Android target directly
