// Script: fix-missing-uploads.js
// Usage: ATLAS_URL="..." node scripts/fix-missing-uploads.js

const mongoose = require('mongoose');
const Listing = require('../model/listing');
const fs = require('fs');
const path = require('path');

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
    const localPath = path.join(__dirname, '..', 'public', rel);
    if (!fs.existsSync(localPath)) {
      console.log(`Missing file for listing ${l._id}: ${localPath} -> updating to placeholder`);
      l.image.url = '/images/placeholder.svg';
      l.image.filename = '';
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