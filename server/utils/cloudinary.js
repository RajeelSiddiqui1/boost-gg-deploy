const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Creates a CloudinaryStorage engine for multer.
 * @param {string} folder - Cloudinary folder to upload into (e.g. 'boostgg/games')
 * @param {string[]} allowedFormats - Allowed file formats (e.g. ['jpg', 'png', 'webp'])
 * @returns CloudinaryStorage instance
 */
const createCloudinaryStorage = (folder, allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'svg']) => {
    return new CloudinaryStorage({
        cloudinary,
        params: {
            folder,
            allowed_formats: allowedFormats,
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
    });
};

/**
 * Delete an asset from Cloudinary by its public_id.
 * @param {string} publicId - The public_id of the Cloudinary asset to delete.
 */
const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error('Cloudinary delete error:', err);
    }
};

/**
 * Extract the public_id from a full Cloudinary URL.
 * e.g. https://res.cloudinary.com/demo/image/upload/v1234/boostgg/games/abc.jpg
 * → boostgg/games/abc
 */
const getPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        // Skip version segment (e.g. v1234567890)
        const afterUpload = parts.slice(uploadIndex + 1);
        if (afterUpload[0] && afterUpload[0].startsWith('v')) afterUpload.shift();
        const fileWithExt = afterUpload.join('/');
        // Remove extension
        return fileWithExt.replace(/\.[^.]+$/, '');
    } catch {
        return null;
    }
};

module.exports = { cloudinary, createCloudinaryStorage, deleteFromCloudinary, getPublicIdFromUrl };
