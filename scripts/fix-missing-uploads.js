// Script: fix-missing-uploads.js
// Usage: ATLAS_URL="..." node scripts/fix-missing-uploads.js

require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('../model/listing');
const fs = require('fs');
const path = require('path');

// Optional: cloudinary is required for migrating to CDN URLs
let cloudinary = null;
if (process.env.CLOUD_NAME && process.env.CLOUD_API_KEY && process.env.CLOUD_API_SECRET) {
  try {
    cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    });
  } catch (err) {
    console.warn('Cloudinary not configured for migration:', err.message);
    cloudinary = null;
  }
}

async function main() {
  const dbUrl = process.env.ATLAS_URL;
  if (!dbUrl) {
    console.error('Please set ATLAS_URL environment variable');
    process.exit(1);
  }
  await mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  const all = await Listing.find({ 'image.url': { $regex: '^/uploads/' } });
  console.log(`Found ${all.length} listings with local uploads`);

  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  let updated = 0;

  for (const l of all) {
    const url = l.image && l.image.url;
    if (!url) continue;

    const rel = url.replace(/^\//, '');
    const localPath = path.join(__dirname, '..', rel);

    if (!fs.existsSync(localPath)) {
      if (cloudinary && l.image && l.image.filename) {
        const safeUrl = cloudinary.url(l.image.filename, { secure: true });
        console.log(`Missing local file for listing ${l._id}. Using Cloudinary URL: ${safeUrl}`);
        l.image.url = safeUrl;
      } else {
        // Attempt to infer filename from URL if not present
        if (l.image && !l.image.filename) {
          const inferred = path.basename(url, path.extname(url));
          if (inferred) {
            l.image.filename = inferred;
          }
        }

        if (cloudinary && l.image && l.image.filename) {
          const safeUrl = cloudinary.url(l.image.filename, { secure: true });
          console.log(`Missing local file for listing ${l._id}. Inferred Cloudinary URL: ${safeUrl}`);
          l.image.url = safeUrl;
        } else {
          console.log(`Missing file for listing ${l._id}: ${localPath} -> placeholder`);
          l.image.url = '/images/placeholder.svg';
          l.image.filename = l.image.filename || '';
        }
      }

      await l.save();
      updated++;
    }
  }

  console.log(`Updated ${updated} listings`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});