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

module.exports = router;
