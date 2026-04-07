const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/blogs directory exists
const uploadDir = path.join(__dirname, '../uploads/blogs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
        cb(null, 'blog-' + name + '-' + uniqueSuffix + ext);
    }
});

const blogUpload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024,       // 10MB
        fieldSize: 10 * 1024 * 1024        // 10MB for large text fields
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const isImage = file.mimetype.startsWith('image/') || extname;
        if (isImage) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

module.exports = blogUpload;
