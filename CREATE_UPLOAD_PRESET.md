# How to Create Upload Preset in Cloudinary (2 Minutes)

## Quick Steps

### Step 1: Go to Cloudinary Dashboard
1. Go to: https://console.cloudinary.com/
2. Log in to your account

### Step 2: Create Upload Preset
1. Click the **⚙️ Settings** icon (top right)
2. Click **"Upload"** tab
3. Scroll down to **"Upload presets"** section
4. Click **"Add upload preset"** button

### Step 3: Configure Preset
Fill in these fields:

**Preset name:**
```
fast-connect-uploads
```
(Must match exactly what's in your `.env.local`)

**Signing mode:**
- Select **"Unsigned"** ⚠️ (This is important!)

**Folder (optional):**
```
fast-connect/documents
```

**Allowed formats:**
- Check: PDF, DOC, DOCX, JPG, PNG
- Or select "All formats" for development

**Max file size:**
- Set to `10` MB

### Step 4: Save
Click **"Save"** button at the bottom

### Step 5: Verify
1. Go back to Upload presets list
2. You should see `fast-connect-uploads` in the list
3. Make sure it shows "Unsigned" mode

## Your .env.local Should Have

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dpe7dbv1j
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=fast-connect-uploads
```

## Restart Server

After creating the preset:
```bash
# Stop server (Ctrl + C)
npm run dev
```

## That's It!

Now try uploading a document - it should work!

## Direct Link

Go directly to upload presets:
https://console.cloudinary.com/settings/upload

Then click "Add upload preset"

