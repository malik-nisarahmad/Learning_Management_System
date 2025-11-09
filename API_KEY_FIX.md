# Fix: Firebase API Key Not Valid Error

## Common Causes & Solutions

### 1. ✅ Check API Key Restrictions in Firebase Console

The API key might have restrictions that prevent it from working:

1. Go to: https://console.cloud.google.com/apis/credentials?project=fast-connect-58826
2. Find your API key (starts with `AIzaSyB1M3VyLxHCLX5sZOsK1M-h4O5EkU2jFOM`)
3. Click on the API key to edit it
4. Check **"API restrictions"**:
   - If restricted, make sure **"Firebase Authentication API"** is enabled
   - OR set to **"Don't restrict key"** (for development)
5. Check **"Application restrictions"**:
   - Set to **"None"** (for development)
   - OR add `localhost` to HTTP referrers if using referrer restrictions
6. Click **"Save"**

### 2. ✅ Verify .env.local File Format

Your `.env.local` file should look EXACTLY like this (no quotes, no spaces):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB1M3VyLxHCLX5sZOsK1M-h4O5EkU2jFOM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fast-connect-58826.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fast-connect-58826
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fast-connect-58826.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=233127658099
NEXT_PUBLIC_FIREBASE_APP_ID=1:233127658099:web:fc225a5a23b2ccf313e006
```

**Common mistakes:**
- ❌ `NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."` (with quotes)
- ❌ `NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSy...` (with spaces)
- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...` (correct)

### 3. ✅ Enable Required APIs

Make sure these APIs are enabled in Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/library?project=fast-connect-58826
2. Search and enable:
   - **Identity Toolkit API** (Firebase Authentication)
   - **Firebase Authentication API**

### 4. ✅ Clear Browser Cache & Restart Server

1. **Stop the dev server** (Ctrl + C)
2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   ```
   Or on Windows PowerShell:
   ```powershell
   Remove-Item -Recurse -Force .next
   ```
3. **Restart the server:**
   ```bash
   npm run dev
   ```

### 5. ✅ Check Browser Console

Open browser console (F12) and look for:
- `🔍 Firebase Config Check:` - Shows what values are loaded
- Any error messages about the API key

### 6. ✅ Verify API Key is Correct

1. Go to Firebase Console: https://console.firebase.google.com/project/fast-connect-58826/settings/general
2. Scroll to "Your apps"
3. Click on your Web app
4. Verify the `apiKey` matches what's in your `.env.local`
5. If different, update `.env.local` and restart server

### 7. ✅ Regenerate API Key (Last Resort)

If nothing works, create a new API key:

1. Go to: https://console.cloud.google.com/apis/credentials?project=fast-connect-58826
2. Click **"Create Credentials"** → **"API key"**
3. Copy the new API key
4. Update `.env.local` with the new key
5. Restart server

## Quick Checklist

- [ ] API key has no restrictions OR Firebase Authentication API is enabled
- [ ] `.env.local` file has correct format (no quotes, no spaces)
- [ ] Identity Toolkit API is enabled in Google Cloud
- [ ] Server was restarted after updating `.env.local`
- [ ] Browser cache cleared
- [ ] API key in `.env.local` matches Firebase Console

## Still Not Working?

1. Check browser console (F12) for the debug message: `🔍 Firebase Config Check:`
2. Verify the API key shown matches what's in Firebase Console
3. Try creating a new Web app in Firebase and using its API key
4. Make sure you're using the correct project (fast-connect-58826)

