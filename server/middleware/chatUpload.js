const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'chats';
        let subfolder = 'others';

        if (file.mimetype.startsWith('image/')) {
            subfolder = 'images';
        } else if (file.mimetype.startsWith('video/')) {
            subfolder = 'videos';
        } else if (file.mimetype === 'application/pdf') {
            subfolder = 'pdf';
        }

        const dest = path.join(__dirname, '../uploads', folder, subfolder);
        
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

const chatUpload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for videos
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif|mp4|webm|ogg|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('File type not supported in chat!'));
        }
    }
});

module.exports = chatUpload;
