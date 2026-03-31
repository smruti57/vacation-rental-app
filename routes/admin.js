const express = require('express');
const router = express.Router();
const Listing = require('../model/listing');
const fs = require('fs');
const path = require('path');

// POST /admin/fix-missing-uploads
// Body: { secret: '...' }
router.post('/fix-missing-uploads', async (req, res) => {
  try {
    const secret = req.body && req.body.secret;
    if (!process.env.ADMIN_SECRET) {
      return res.status(500).json({ ok: false, error: 'ADMIN_SECRET not configured on server' });
    }
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    const all = await Listing.find({ 'image.url': { $regex: '^/uploads/' } });
    let updated = 0;
    for (const l of all) {
      const url = l.image && l.image.url;
      if (!url) continue;
      const rel = url.replace(/^\//, '');
      const localPath = path.join(__dirname, '..', 'public', rel);
      if (!fs.existsSync(localPath)) {
        l.image.url = '/images/placeholder.svg';
        l.image.filename = '';
        await l.save();
        updated++;
      }
    }
    return res.json({ ok: true, updated });
  } catch (err) {
    console.error('Error in admin fix route:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /admin/debug/listing/:id
// View raw image URL and storage details for a specific listing (for troubleshooting)
router.get('/debug/listing/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    const imageUrl = listing.image?.url || 'NO IMAGE URL STORED';
    const isCloudinary = imageUrl.includes('res.cloudinary.com') || imageUrl.includes('https://') || imageUrl.includes('http://');
    const isLocal = imageUrl.startsWith('/uploads/');
    
    let fileExists = false;
    if (isLocal) {
      const filePath = path.join(__dirname, '..', 'public', imageUrl);
      fileExists = fs.existsSync(filePath);
    }
    
    return res.json({
      listing: {
        id: listing._id,
        title: listing.title,
        owner: listing.owner?._id
      },
      image: {
        url: imageUrl,
        filename: listing.image?.filename || 'NO FILENAME',
        isCloudinary: isCloudinary,
        isLocal: isLocal,
        fileExistsLocally: fileExists,
        urlStarts: imageUrl.substring(0, 80)
      },
      cloudinary_env_set: !!process.env.CLOUD_NAME
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
