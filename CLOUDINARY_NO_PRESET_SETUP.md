# Cloudinary Setup - No Upload Preset Needed!

## ✅ Good News!

You don't need to create an upload preset anymore! The uploads now go through your backend server, which uses your API secret directly.

## Step 1: Update Your `.env` File (Backend)

Add these to your `.env` file (NOT `.env.local`):

```env
# Cloudinary Configuration (Backend)
CLOUDINARY_CLOUD_NAME=dpe7dbv1j
CLOUDINARY_API_KEY=287572633816344
CLOUDINARY_API_SECRET=MokhMmlyLQRUw0TcWitoQgLVnF4
```

**Important:**
- These go in `.env` (backend), not `.env.local` (frontend)
- The API Secret should stay secret (never commit to git)

## Step 2: Update Your `.env.local` File (Frontend)

You can REMOVE the Cloudinary variables from `.env.local` since we're using backend uploads now:

```env
# Remove these - not needed anymore:
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dpe7dbv1j
# NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=fast-connect-uploads
# NEXT_PUBLIC_CLOUDINARY_CLOUD_API_KEY=287572633816344
# NEXT_PUBLIC_CLOUDINARY_CLOUD_API_SECRET=MokhMmlyLQRUw0TcWitoQgLVnF4
```

Or keep them if you want, but they're not used for uploads anymore.

## Step 3: Restart Both Servers

1. **Backend server:**
   ```bash
   # Stop (Ctrl + C)
   node app.js
   ```

2. **Frontend server:**
   ```bash
   # Stop (Ctrl + C)
   npm run dev
   ```

## How It Works Now

1. Student selects file → Frontend
2. Frontend sends file to your backend → `POST /upload/document`
3. Backend uploads to Cloudinary using API secret → No preset needed!
4. Backend returns Cloudinary URL → Frontend
5. Frontend saves document metadata → Backend

## Benefits

✅ **No upload preset needed** - Backend handles everything
✅ **More secure** - API secret stays on server
✅ **Better control** - You can add validation, logging, etc.
✅ **Easier setup** - Just add credentials to `.env`

## Troubleshooting

### "Network error during upload"
- Make sure backend server is running: `node app.js`
- Check that backend is on port 3001

### "Cloudinary upload error"
- Verify credentials in `.env` are correct
- Check backend console for specific error
- Make sure API Secret is correct (no extra spaces)

### Still not working?
- Check backend console for Cloudinary initialization message
- Verify `.env` file has all three Cloudinary variables
- Restart backend server after adding credentials

## Your Configuration

✅ **Cloud Name:** `dpe7dbv1j`
✅ **API Key:** `287572633816344`
✅ **API Secret:** `MokhMmlyLQRUw0TcWitoQgLVnF4`
❌ **Upload Preset:** Not needed anymore!

