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
                allowed_formats: ['png','jpg','jpeg']
            }
        });
    } catch (err) {
        console.warn('Cloudinary configuration failed, falling back to local storage', err && err.message);
        cloudinary = null;
    }
}

// Fallback to local disk storage if Cloudinary not configured
if (!storage) {
    const path = require('path');
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadsDir);
        },
        filename: function (req, file, cb) {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = file.originalname.split('.').pop();
            cb(null, `${unique}.${ext}`);
        }
    });
}

module.exports = {
    cloudinary,
    storage,
};