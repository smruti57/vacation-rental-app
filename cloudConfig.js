const multer = require('multer');
let cloudinary = null;
let storage = null;

// If Cloudinary credentials present, use Cloudinary storage
if (process.env.CLOUD_NAME && process.env.CLOUD_API_KEY && process.env.CLOUD_API_SECRET) {
    try {
        cloudinary = require('cloudinary').v2;
        const { CloudinaryStorage } = require('multer-storage-cloudinary');
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUD_API_KEY,
            api_secret: process.env.CLOUD_API_SECRET
        });
        storage = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: {
                folder: 'wanderlust_DEV',
                allowed_formats: ['png','jpg','jpeg','webp','gif','bmp'],
                resource_type: 'auto'
            }
        });
        console.log(`✓ Cloudinary initialized for cloud: ${process.env.CLOUD_NAME}`);
    } catch (err) {
        console.warn('⚠ Cloudinary configuration failed, falling back to local storage', err && err.message);
        cloudinary = null;
    }
}

// Fallback to local disk storage if Cloudinary not configured
if (!storage) {
    const path = require('path');
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    
    // Ensure uploads directory exists
    const fs = require('fs');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`✓ Created uploads directory at ${uploadsDir}`);
    }
    
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadsDir);
        },
        filename: function (req, file, cb) {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname).slice(1);
            cb(null, `${unique}.${ext}`);
        }
    });
    console.log(`✓ Using LOCAL DISK STORAGE for uploads at: ${uploadsDir}`);
}

module.exports = {
    cloudinary,
    storage,
    // Middleware to ensure req.file.path is set to web-accessible URL
    ensureFilePath: (req, res, next) => {
        if (req.file) {
            // For Cloudinary: req.file.path should already be a full HTTP URL
            if (req.file.path && req.file.path.startsWith('http')) {
                console.log(`✓ Cloudinary URL: ${req.file.path}`);
            } else {
                // For local storage: convert absolute path to web URL
                // req.file.path might be the full absolute path, extract just the filename
                const filename = req.file.filename || req.file.originalname;
                req.file.path = `/uploads/${filename}`;
                console.log(`✓ Local upload path set to: ${req.file.path}`);
            }
        }
        next();
    }
};