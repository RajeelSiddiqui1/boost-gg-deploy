const asyncHandler = require('express-async-handler');
const path = require('path');

// @desc    Upload multiple files
// @route   POST /api/v1/uploads/multiple
// @access  Private/Admin
const uploadMultiple = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error('Please upload files');
    }

    const urls = req.files.map(file => {
        // Get the folder name from the destination path (e.g., .../uploads/accounts -> accounts)
        const parts = file.destination.split(path.sep);
        const folder = parts[parts.length - 1];
        return `/uploads/${folder}/${file.filename}`;
    });

    res.status(200).json({
        success: true,
        data: urls
    });
});

module.exports = {
    uploadMultiple
};
