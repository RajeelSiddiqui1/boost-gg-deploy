const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllSections,
    getSection,
    createSection,
    updateSection,
    deleteSection,
    toggleStatus,
    reorderSections,
    getSectionsByGame,
    getSectionsByService,
    duplicateSection,
    exportSections,
    importSections
} = require('../controllers/customSectionController');

// Public routes
router.get('/', getAllSections);
router.get('/export', protect, authorize('admin'), exportSections);
router.get('/game/:gameId', getSectionsByGame);
router.get('/service/:serviceId', getSectionsByService);
router.get('/:idOrSectionId', getSection);

// Admin routes
router.post('/import', protect, authorize('admin'), importSections);
router.post('/', protect, authorize('admin'), createSection);
router.post('/:id/duplicate', protect, authorize('admin'), duplicateSection);

router.put('/:id', protect, authorize('admin'), updateSection);
router.delete('/:id', protect, authorize('admin'), deleteSection);

router.patch('/:id/status', protect, authorize('admin'), toggleStatus);
router.patch('/reorder', protect, authorize('admin'), reorderSections);

module.exports = router;
