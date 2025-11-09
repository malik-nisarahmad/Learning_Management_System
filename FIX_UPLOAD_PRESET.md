# Fix: "Upload preset not found" Error

## The Problem

The upload preset `fast-connect-uploads` doesn't exist in your Cloudinary account yet. You need to create it.

## Quick Fix - Create Upload Preset

### Step 1: Go to Cloudinary Dashboard

1. Go to: https://console.cloudinary.com/
2. Log in to your account

### Step 2: Create Upload Preset

1. Click the **⚙️ Settings** icon (top right corner)
2. Click on **"Upload"** tab
3. Scroll down to **"Upload presets"** section
4. Click **"Add upload preset"** button
5. Fill in the form:

   **Preset name:**
   ```
   fast-connect-uploads
   ```
   (Must match exactly what's in your `.env.local`)

   **Signing mode:**
   - Select **"Unsigned"** (important for frontend uploads!)

   **Folder:**
   ```
   fast-connect/documents
   ```
   (Optional, but recommended for organization)

   **Allowed formats:**
   - Check: PDF, DOC, DOCX, JPG, PNG
   - Or select "All formats" for development

   **Max file size:**
   - Set to `10` MB (or your preference)

6. Click **"Save"** button at the bottom

### Step 3: Verify Your .env.local

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dpe7dbv1j
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=fast-connect-uploads
```

**Note:** You don't need the API Key and Secret in `.env.local` for frontend uploads. Those are only for backend operations.

### Step 4: Restart Server

1. Stop your server (Ctrl + C)
2. Start again: `npm run dev`

### Step 5: Test Upload

Try uploading a document again. It should work now!

## Alternative: Use Default Preset

If you want to use Cloudinary's default unsigned preset, you can:

1. In `.env.local`, change to:
   ```env
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
   ```

2. Or remove the preset requirement (but this requires code changes)

## Verify Preset Exists

To check if your preset exists:

1. Go to: Settings → Upload → Upload presets
2. Look for `fast-connect-uploads` in the list
3. If it's not there, create it following Step 2 above

## Common Issues

### "Preset not found" even after creating
- Make sure the preset name in `.env.local` matches exactly (case-sensitive)
- Make sure it's set to "Unsigned" mode
- Restart your server after creating the preset

### Still not working?
- Check browser console (F12) for detailed error
- Verify Cloud Name is correct: `dpe7dbv1j`
- Make sure preset name matches exactly: `fast-connect-uploads`

## Your Current Config

✅ Cloud Name: `dpe7dbv1j` (correct)
❌ Upload Preset: `fast-connect-uploads` (needs to be created)
ℹ️ API Key/Secret: Not needed for frontend uploads

