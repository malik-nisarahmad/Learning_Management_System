# Cloudinary Setup Guide for Document Uploads

## Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email

## Step 2: Get Your Cloudinary Credentials

1. After logging in, you'll see your **Dashboard**
2. Copy these values:
   - **Cloud Name** (e.g., `dxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

## Step 3: Create Upload Preset

1. In Cloudinary Dashboard, go to **Settings** → **Upload** (or click the gear icon)
2. Scroll down to **"Upload presets"** section
3. Click **"Add upload preset"**
4. Configure:
   - **Preset name**: `fast-connect-uploads` (or any name you prefer)
   - **Signing mode**: Choose one:
     - **Unsigned** (easier for development, less secure)
     - **Signed** (more secure, requires backend signature)
   - **Folder**: `fast-connect/documents` (optional, for organization)
   - **Allowed formats**: Select file types (PDF, DOC, DOCX, JPG, PNG, etc.)
   - **Max file size**: Set to 10MB or your preferred limit
5. Click **"Save"**
6. Copy the **Preset name** you created

## Step 4: Configure Environment Variables

Add these to your `.env.local` file (for Next.js frontend):

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=fast-connect-uploads
```

**Important:**
- Use `NEXT_PUBLIC_` prefix so these are available in the browser
- Do NOT put your API Secret in the frontend (it's only for backend use)
- The upload preset name should match what you created in Cloudinary

## Step 5: Optional - Backend Configuration

If you want to use signed uploads (more secure), add to your `.env` file (backend):

```env
# Cloudinary Backend (for signed uploads - optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

## Step 6: Test the Upload

1. Start your development server: `npm run dev`
2. Go to Study Materials page
3. Click "Upload Material"
4. Fill in the form and upload a document
5. Check Cloudinary Dashboard → **Media Library** to see your uploaded file

## Security Best Practices

### For Development (Unsigned Uploads):
- ✅ Quick to set up
- ✅ Works immediately
- ⚠️ Less secure (anyone with your preset can upload)
- ⚠️ Set file size and type restrictions in preset

### For Production (Signed Uploads):
- ✅ More secure
- ✅ Server validates uploads
- ⚠️ Requires backend endpoint to generate signatures
- ⚠️ More complex setup

## File Organization

Uploads will be organized in Cloudinary by folder:
- `fast-connect/documents/` - All student documents
- You can add subfolders like:
  - `fast-connect/documents/pdfs/`
  - `fast-connect/documents/images/`

## Troubleshooting

### "Cloudinary is not configured" error
- Check that `.env.local` has `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- Restart your dev server after adding environment variables

### "Upload preset not found" error
- Verify the preset name in `.env.local` matches Cloudinary dashboard
- Check that the preset is set to "Unsigned" (for development)

### Upload fails
- Check file size (should be under 10MB by default)
- Verify file type is allowed in your upload preset
- Check browser console for specific error messages

### Files not appearing in Cloudinary
- Check Cloudinary Dashboard → Media Library
- Verify the folder path is correct
- Check upload preset settings

## Quick Reference

### Your Cloudinary Info:
- **Cloud Name**: Found in Dashboard
- **API Key**: Found in Dashboard
- **API Secret**: Found in Dashboard (keep secret!)
- **Upload Preset**: Create in Settings → Upload → Upload presets

### Environment Variables Needed:
```env
# Frontend (.env.local)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset-name

# Backend (.env) - Optional, for signed uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Next Steps

After setup:
1. ✅ Test document upload
2. ✅ Verify files appear in Cloudinary Media Library
3. ✅ Check that document URLs are saved correctly
4. ✅ Test downloading/viewing uploaded documents

