# Quick Fix: Firebase Configuration Error

## ✅ Step-by-Step Fix

### 1. Check Your `.env.local` File

Open `.env.local` in the root directory and make sure it looks like this (with YOUR actual values):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fast-connect-58826.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fast-connect-58826
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fast-connect-58826.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=233127658099
NEXT_PUBLIC_FIREBASE_APP_ID=1:233127658099:web:xxxxxxxxxxxxxxxx
```

**Important checks:**
- ❌ No quotes around values (don't use `"value"` or `'value'`)
- ❌ No spaces around the `=` sign
- ✅ API Key starts with `AIza`
- ✅ App ID format: `1:233127658099:web:xxxxx`

### 2. Get Your Missing Keys from Firebase

#### Get API Key and App ID:

1. Go to: https://console.firebase.google.com/project/fast-connect-58826/settings/general
2. Scroll down to **"Your apps"** section
3. If you see a **Web app** (`</>` icon), click on it
4. If you DON'T see a web app:
   - Click **"Add app"** button
   - Click the **Web icon** (`</>`)
   - Register app name: "FAST Connect Web"
   - Click **"Register app"**
5. You'll see a config like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",  ← COPY THIS
  authDomain: "fast-connect-58826.firebaseapp.com",
  projectId: "fast-connect-58826",
  storageBucket: "fast-connect-58826.appspot.com",
  messagingSenderId: "233127658099",
  appId: "1:233127658099:web:xxxxxxxxxxxxxxxx"  ← COPY THIS
};
```

6. Copy the `apiKey` and `appId` values to your `.env.local`

### 3. Enable Email/Password Authentication

1. Go to: https://console.firebase.google.com/project/fast-connect-58826/authentication/providers
2. Click **"Get started"** (if first time)
3. Click on **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Toggle **"Enable"** to **ON**
6. Click **"Save"**

### 4. Restart Your Development Server

**This is CRITICAL!** Environment variables are only loaded when the server starts.

1. **Stop your server:**
   - Press `Ctrl + C` in the terminal where `npm run dev` is running

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Check the browser console** (F12 → Console tab):
   - You should NOT see Firebase errors
   - If you see errors, check the console for which variable is missing

### 5. Test Login/Register

After restarting:
1. Go to the login page
2. Try to register a new account OR login
3. The error should be gone!

## 🔍 Troubleshooting

### Still seeing "Firebase is not configured"?

**Check 1:** Open browser console (F12) and look for:
```
❌ Missing Firebase environment variables: NEXT_PUBLIC_FIREBASE_API_KEY, ...
```
This tells you which variables are missing.

**Check 2:** Make sure `.env.local` is in the **root directory** (same folder as `package.json`)

**Check 3:** Verify no typos in variable names:
- `NEXT_PUBLIC_FIREBASE_API_KEY` (not `API_KEY` or `FIREBASE_API_KEY`)
- All variables must start with `NEXT_PUBLIC_`

**Check 4:** Restart the server after making changes

### "Invalid API key" error?

- Make sure you copied the ENTIRE API key (it's long, starts with `AIza`)
- No extra spaces or quotes
- The API key should be on the same line as the variable name

### Still not working?

1. **Check browser console** (F12) for specific error messages
2. **Check terminal** where `npm run dev` is running for errors
3. **Verify** your `.env.local` file format matches the example above exactly

## 📝 Quick Checklist

- [ ] `.env.local` file exists in root directory
- [ ] All 6 Firebase variables are filled in
- [ ] No quotes around values
- [ ] No spaces around `=` signs
- [ ] API Key starts with `AIza`
- [ ] Email/Password authentication is enabled in Firebase
- [ ] Development server was restarted after adding keys
- [ ] Browser console shows no Firebase errors

## 🚀 Once Working

After Firebase is configured:
1. You can register new users
2. You can login with existing users
3. Users will appear in Firebase Console → Authentication → Users

