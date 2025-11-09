# Firebase Authentication Setup Guide

## Step 1: Create Firebase Project

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., "FAST Connect")
4. Disable Google Analytics (optional, for free tier)
5. Click **"Create project"**

## Step 2: Enable Authentication

1. In your Firebase project, go to **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Click on the **"Sign-in method"** tab
4. Enable **"Email/Password"** authentication:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 3: Get Web App Configuration

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** `</>` to add a web app
5. Register your app with a nickname (e.g., "FAST Connect Web")
6. **Copy the Firebase configuration object** - it looks like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

## Step 4: Set Up Firebase Admin SDK (Backend)

### Option A: Using Service Account (Recommended)

1. In Firebase Console, go to **"Project settings"**
2. Click on the **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** - this downloads a JSON file
5. **Save this file securely** - it contains sensitive credentials

### Option B: Using Environment Variables

You can also use individual environment variables instead of the service account file.

## Step 5: Configure Environment Variables

Create a `.env.local` file in the root directory for Next.js frontend:

```env
# Firebase Web App Configuration (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

Create a `.env` file in the root directory for the backend:

### Option A: Using Service Account JSON
```env
# Firebase Admin SDK (Backend) - Option 1: Service Account JSON
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}
```

### Option B: Using Individual Variables
```env
# Firebase Admin SDK (Backend) - Option 2: Individual Variables
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

## Step 6: Configure Authorized Domains

1. In Firebase Console, go to **"Authentication"** → **"Settings"**
2. Scroll to **"Authorized domains"**
3. Add `localhost` if not already present (for development)
4. Add your production domain when deploying

## Step 7: Test the Setup

1. Start your backend: `node app.js`
2. Start your frontend: `npm run dev`
3. Try registering a new user
4. Check Firebase Console → Authentication → Users to see the new user

## Troubleshooting

### "Firebase: Error (auth/api-key-not-valid)"
- Make sure your `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
- Check that you copied the entire API key from Firebase Console

### "Firebase Admin SDK initialization error"
- Verify your service account JSON is valid
- Make sure environment variables are set correctly
- Check that the private key includes `\n` characters for newlines

### "Email already in use"
- This is normal - the user already exists
- Use the login page instead

### Email Verification Not Working
- Check your email spam folder
- Make sure email/password authentication is enabled in Firebase Console
- Verify the email address is correct

## Security Notes

- **Never commit** `.env` or `.env.local` files to git
- Keep your service account JSON file secure
- Use environment variables in production
- Enable Firebase App Check for additional security (optional)

## Next Steps

- Set up Firebase Storage for file uploads (if needed)
- Configure Firebase Hosting for deployment (optional)
- Set up custom user claims for roles (admin/student) - already implemented in the code

