const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const iconDir = path.join(__dirname, '../uploads/services/icon');
const bgDir = path.join(__dirname, '../uploads/services/background');
if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
}
if (!fs.existsSync(bgDir)) {
    fs.mkdirSync(bgDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'backgroundImage' || file.fieldname === 'image') {
            cb(null, bgDir);
        } else if (file.fieldname === 'icon') {
            cb(null, iconDir);
        } else {
            cb(null, iconDir);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
        cb(null, 'service-' + name + '-' + uniqueSuffix + ext);
    }
});

const serviceUpload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

module.exports = serviceUpload;
