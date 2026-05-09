const multer = require('multer');
const path = require('path');
const fs = require('fs');

const makeStorage = (subfolder) =>
    multer.diskStorage({
        destination: function (req, file, cb) {
            const dest = path.join(__dirname, '../uploads/orders', subfolder);
            if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
            cb(null, dest);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
            cb(null, `${name}-${uniqueSuffix}${ext}`);
        }
    });

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|mp4|webm/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Only images and videos are allowed'));
};

// Pro completion proof → uploads/orders/complete-order-proof
const proofUpload = multer({
    storage: makeStorage('complete-order-proof'),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter
});

// Customer confirmation proof → uploads/orders/customer-order-proof
const customerProofUpload = multer({
    storage: makeStorage('customer-order-proof'),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter
});

module.exports = { proofUpload, customerProofUpload };
