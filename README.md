<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Look Away

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c127550e-b3c8-4a9f-a6e0-f9fb0efd6bd5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Reports

The primary report email is saved as the user's default in Supabase and remains prefilled until changed. The optional secondary email is used only for the current report and starts blank on the next report. Reports are saved in Supabase and sent through the server's GMass SMTP connection.

## Supabase

1. Create `.env` from [.env.example](.env.example) and add the Supabase project URL and anon key.
2. Run [supabase/migrations/001_look_away.sql](supabase/migrations/001_look_away.sql) in the Supabase SQL Editor.
3. Configure email confirmation in Supabase Authentication, then sign up through the app and confirm the email before logging in.
4. Add the SMTP values in `.env` so report delivery is enabled.

To configure email delivery, copy `.env.example` to `.env` and replace the placeholders with the SMTP credentials from your GMass account. Keep `.env` private and run the app with `npm run dev` or `npm start`.

The same React bundle is used for the web app, Android, and iOS through Capacitor. Deploy the server to a public HTTPS URL, set `VITE_API_BASE_URL` to that URL before `npm run cap:sync`, and then build the native apps. Leave it empty for web deployments served by this server.

## Android and iOS

The native apps use Capacitor and share the same mobile React experience as the web app.

1. Install dependencies: `npm install`
2. Build and sync native projects: `npm run cap:sync`
3. Open Android Studio: `npm run cap:android`
4. Open Xcode on macOS: `npm run cap:ios`

To build an Android debug APK from the command line:

`cd android && ./gradlew assembleDebug`

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. Android Studio should use its bundled JDK 21 and have an Android SDK installed. iOS builds require macOS, Xcode, and CocoaPods.
