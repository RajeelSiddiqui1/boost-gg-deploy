const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validators, handleValidationErrors } = require('../middleware/validation');
const upload = require('../middleware/upload');
const {
    getAllGames,
    getAdminGames,
    getGame,
    getGameBySlug,
    createGame,
    updateGame,
    deleteGame,
    toggleGameStatus,
    reorderGames,
    bulkDeleteGames
} = require('../controllers/gameController');

const { getWoWServices } = require('../controllers/serviceController');

// Public routes
router.get('/', getAllGames);
router.get('/:id', [validators.mongoId, handleValidationErrors], getGame);
router.get('/slug/:slug', getGameBySlug);

// WoW Specialized route
router.get('/wow/services', getWoWServices);

// Admin routes (protected)
router.get('/admin/all', [protect, authorize('admin')], getAdminGames);

router.post(
    '/admin',
    [protect, authorize('admin')],
    upload.fields([
        { name: 'bgImage', maxCount: 1 },
        { name: 'characterImage', maxCount: 1 },
        { name: 'icon', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]),
    createGame
);

router.put(
    '/admin/:id',
    [protect, authorize('admin'), validators.mongoId, handleValidationErrors],
    upload.fields([
        { name: 'bgImage', maxCount: 1 },
        { name: 'characterImage', maxCount: 1 },
        { name: 'icon', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]),
    updateGame
);

router.delete('/admin/bulk', [protect, authorize('admin')], bulkDeleteGames);
router.delete('/admin/:id', [protect, authorize('admin'), validators.mongoId, handleValidationErrors], deleteGame);
router.patch('/admin/:id/status', [protect, authorize('admin'), validators.mongoId, handleValidationErrors], toggleGameStatus);
router.patch('/admin/reorder', [protect, authorize('admin')], reorderGames);

// Sync services from Service collection to Game collection
router.post('/admin/sync-services', [protect, authorize('admin')], async (req, res) => {
    try {
        const Game = require('../models/Game');
        await Game.syncServices();
        res.json({ success: true, message: 'Services synced successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
