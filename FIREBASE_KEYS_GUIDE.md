# How to Get Your Firebase Keys

## Step 1: Get Frontend Keys (for .env.local)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **Fast-connect** (fast-connect-58826)
3. Click the **⚙️ Gear icon** next to "Project Overview"
4. Select **"Project settings"**
5. Scroll down to **"Your apps"** section
6. Look for a **Web app** (`</>` icon)
   - If you don't see one, click **"Add app"** → Select **Web icon** (`</>`)
   - Register your app with a nickname (e.g., "FAST Connect Web")
7. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "fast-connect-58826.firebaseapp.com",
  projectId: "fast-connect-58826",
  storageBucket: "fast-connect-58826.appspot.com",
  messagingSenderId: "233127658099",
  appId: "1:233127658099:web:xxxxxxxxxxxxxxxx"
};
```

8. Copy these values to your `.env.local` file:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` (already filled)
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (already filled)
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (already filled)
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (already filled)
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

## Step 2: Get Backend Keys (for .env)

### Option A: Service Account JSON (Recommended)

1. In Firebase Console, go to **⚙️ Project settings**
2. Click on the **"Service accounts"** tab
3. Click **"Generate new private key"** button
4. Click **"Generate key"** in the popup
5. A JSON file will download (e.g., `fast-connect-58826-firebase-adminsdk-xxxxx.json`)
6. Open the JSON file and copy the **entire content**
7. Paste it into `.env` file as the value for `FIREBASE_SERVICE_ACCOUNT`

**Example:**
```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"fast-connect-58826","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@fast-connect-58826.iam.gserviceaccount.com",...}
```

### Option B: Individual Variables (Alternative)

If you prefer individual variables, extract these from the service account JSON:
- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters)

## Step 3: Enable Authentication

1. In Firebase Console, go to **"Authentication"** in the left sidebar
2. Click **"Get started"** (if first time)
3. Click on **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Toggle **"Enable"** to ON
6. Click **"Save"**

## Step 4: Verify Your Setup

After filling in the keys:

1. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Check the console** - you should see:
   - ✅ No Firebase errors
   - ✅ "Firebase initialized successfully" (if logged)

3. **Test registration:**
   - Go to the register page
   - Try creating an account
   - Check Firebase Console → Authentication → Users to see the new user

## Quick Reference

### Your Project Info:
- **Project Name:** Fast-connect
- **Project ID:** fast-connect-58826
- **Project Number:** 233127658099

### Files to Update:
- `.env.local` - Frontend Firebase config (Next.js)
- `.env` - Backend Firebase Admin config (Express)

### Where to Find Keys:
- **Frontend keys:** Project Settings → Your apps → Web app
- **Backend keys:** Project Settings → Service accounts → Generate new private key

## Troubleshooting

### "Invalid API key" error
- Make sure you copied the entire API key (starts with "AIza")
- Check that `.env.local` file exists in the root directory
- Restart your dev server after adding keys

### "Firebase Admin initialization error"
- Verify the service account JSON is valid JSON
- Make sure you copied the entire JSON object
- Check that the JSON is on a single line in `.env` (or properly escaped)

### "Authentication not enabled"
- Make sure Email/Password authentication is enabled in Firebase Console
- Go to Authentication → Sign-in method → Email/Password → Enable

