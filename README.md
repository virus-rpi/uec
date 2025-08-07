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
- Inbox by address (app/inbox/[address].tsx)
- Message detail (app/mail/[id].tsx)
- Node Editor placeholder (app/editor/index.tsx)

## Notes about the dotted font
For now, the font is simulated with subtle text shadow and spacing. To achieve a true dotted font, add a dot‑matrix font file under `assets/fonts/` and load it in `app/_layout.tsx` using `useFonts`, then apply it in a shared ThemedText component.

## Scripts
- `npm start` — start the dev server
- `npm run web` — start the web target directly
- `npm run android` — start the Android target directly
