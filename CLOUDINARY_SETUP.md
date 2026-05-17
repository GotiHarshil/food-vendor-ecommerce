# Cloudinary Setup Guide

## What's Changed

The project now uses **Cloudinary** for image storage instead of serving images from the local server. This reduces server load and provides automatic image optimization and global CDN delivery.

## Setup Steps

### 1. Create a Cloudinary Account

1. Go to https://cloudinary.com
2. Click **Sign Up** (choose the free tier)
3. Create your account with email and password
4. Verify your email

### 2. Get Your Credentials

1. After login, go to your **Dashboard**
2. You'll see three values at the top:
   - **Cloud Name** (blue text)
   - **API Key** (gray text)
   - **API Secret** (hide/show button)

### 3. Update .env File

Edit `server/.env` and add your credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

Example:
```env
CLOUDINARY_CLOUD_NAME=dmyzt8xyz
CLOUDINARY_API_KEY=987654321
CLOUDINARY_API_SECRET=abc123def456ghi789
```

### 4. Migrate Existing Images (Optional)

If you want to upload all existing local images to Cloudinary:

```bash
cd server
node migrateToCloudinary.js
```

This will:
- Find all items with local `/images/` URLs
- Upload each image to Cloudinary
- Update the database with Cloudinary URLs
- Delete the migration script after completion

**Note:** This requires `.env` to be configured first.

## How It Works

### Before (Local Storage)
```
User Browser → Request /images/food.jpg → Your Server → Disk
                      (Slow, server load)
```

### After (Cloudinary)
```
User Browser → Request Cloudinary URL → Cloudinary CDN → Global Servers
                      (Fast, optimized, no server load)
```

## Admin Features

### Uploading New Images

When creating or editing food items in the admin panel:

1. **Option 1:** Provide Cloudinary URL directly in `imageUrl` field
2. **Option 2:** Upload an image file directly (multipart form)
   - Max size: 5MB
   - Allowed: JPEG, PNG, WebP, GIF

### Upload via API

```bash
curl -X POST http://localhost:5000/api/admin/items \
  -H "Content-Type: multipart/form-data" \
  -F "name=Pizza" \
  -F "price=12.99" \
  -F "category=Main Course" \
  -F "description=Delicious pizza" \
  -F "image=@/path/to/image.jpg"
```

## Benefits

✅ **Reduced Server Load** — Images served from CDN, not your server
✅ **Automatic Optimization** — Cloudinary compresses images by 40-60%
✅ **Fast Delivery** — Global CDN ensures quick loading worldwide
✅ **Responsive Images** — Built-in resizing for mobile devices
✅ **Free Tier** — 25 GB storage + unlimited bandwidth
✅ **Easy Scaling** — No disk space concerns as your menu grows

## Free Tier Limits

- **Storage:** 25 GB
- **Bandwidth:** Unlimited
- **Monthly Transformations:** 100,000
- **Perfect for:** Small to medium projects

## Troubleshooting

### "Invalid credentials"
- Check your Cloud Name, API Key, and API Secret in `.env`
- Copy-paste directly from Cloudinary dashboard
- Restart the server after updating `.env`

### "Image upload failed"
- Check file size (max 5MB)
- Check file format (JPEG, PNG, WebP, GIF only)
- Ensure Cloudinary credentials are correct

### "Migration script not found"
- Run from the `server` directory
- Make sure `.env` has Cloudinary credentials first

## Files Added/Modified

**New Files:**
- `server/utils/cloudinary.js` — Cloudinary configuration
- `server/utils/multer.js` — File upload middleware
- `server/utils/uploadToCloudinary.js` — Upload helper function
- `server/migrateToCloudinary.js` — Migration script
- `CLOUDINARY_SETUP.md` — This file

**Modified Files:**
- `server/.env` — Added Cloudinary credentials
- `server/routes/adminRoutes.js` — Added file upload middleware
- `server/controllers/adminController.js` — Updated createItem & updateItem

## Next Steps

1. Sign up for Cloudinary (free account)
2. Add credentials to `.env`
3. Restart the server
4. Test: Create a new food item with an image file
5. (Optional) Run migration script to upload existing images

Done! Your images are now served from Cloudinary's global CDN.
