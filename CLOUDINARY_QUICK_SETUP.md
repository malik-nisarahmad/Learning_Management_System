# Quick Cloudinary Setup - Get Your Cloud Name & Upload Preset

## What You Need (NOT the API Key)

For frontend uploads, you need:
1. **Cloud Name** (e.g., `dxxxxx` or `your-cloud-name`)
2. **Upload Preset** (you need to create this)

The API Key you provided (`287572633816344`) is for backend operations, not frontend uploads.

## Step 1: Get Your Cloud Name

1. Go to [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Log in to your account
3. Look at the top of the dashboard - you'll see your **Cloud Name**
   - It's usually something like: `dxxxxx`, `dyyyyy`, or a custom name
   - It's NOT the API Key number
4. Copy this Cloud Name

## Step 2: Create Upload Preset

1. In Cloudinary Dashboard, click the **⚙️ Settings** icon (top right)
2. Go to **"Upload"** tab
3. Scroll down to **"Upload presets"** section
4. Click **"Add upload preset"** button
5. Fill in:
   - **Preset name**: `fast-connect-uploads` (or any name you like)
   - **Signing mode**: Select **"Unsigned"** (for development)
   - **Folder**: `fast-connect/documents` (optional, but recommended)
   - **Allowed formats**: Check PDF, DOC, DOCX, JPG, PNG
   - **Max file size**: 10 MB (or your preference)
6. Click **"Save"** at the bottom
7. Copy the **Preset name** you just created

## Step 3: Add to .env.local

Open your `.env.local` file and add:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=fast-connect-uploads
```

**Example:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxxxxx
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=fast-connect-uploads
```

## Step 4: Restart Server

After adding the values:
1. Stop your server (Ctrl + C)
2. Start again: `npm run dev`

## Where to Find Everything

### Cloud Name Location:
- Dashboard → Top of the page (next to your account name)
- Or: Settings → Product environment credentials → Cloud name

### Upload Preset Location:
- Settings → Upload tab → Upload presets section
- Create a new one if you don't have any

## Still Can't Find Cloud Name?

If you can't find it:
1. Go to: https://console.cloudinary.com/settings/product-environment
2. Your Cloud Name is displayed there
3. It's usually a short string like `dxxxxx` or a custom name

## Quick Checklist

- [ ] Found Cloud Name in dashboard
- [ ] Created Upload Preset (set to "Unsigned")
- [ ] Added both to `.env.local` file
- [ ] Restarted development server
- [ ] Tested document upload

