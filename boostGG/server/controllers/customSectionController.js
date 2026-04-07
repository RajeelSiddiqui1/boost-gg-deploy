const CustomSection = require('../models/CustomSection');

// @desc    Get all custom sections
// @route   GET /api/v1/custom-sections
// @access  Public (for viewing), Admin (for management)
exports.getAllSections = async (req, res, next) => {
    try {
        const { status, sectionType, gameId, serviceId, page = 1, limit = 20, search } = req.query;
        
        // Build query
        let query = {};
        
        if (status) query.status = status;
        if (sectionType) query.sectionType = sectionType;
        if (gameId) query.gameId = gameId;
        if (serviceId) query.serviceId = serviceId;
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { subheading: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { sectionId: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;
        
        // Execute query
        const sections = await CustomSection.find(query)
            .populate('gameId', 'name title')
            .populate('serviceId', 'title')
            .populate('categoryId', 'name')
            .sort({ displayOrder: 1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await CustomSection.countDocuments(query);

        res.status(200).json({
            success: true,
            data: sections,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single custom section
// @route   GET /api/v1/custom-sections/:idOrSectionId
// @access  Public
exports.getSection = async (req, res, next) => {
    try {
        const { idOrSectionId } = req.params;
        
        let section;
        
        // Check if it's a valid MongoDB ObjectId
        if (idOrSectionId.match(/^[0-9a-fA-F]{24}$/)) {
            section = await CustomSection.findById(idOrSectionId)
                .populate('gameId', 'name title')
                .populate('serviceId', 'title')
                .populate('categoryId', 'name');
        } else {
            // Search by sectionId
            section = await CustomSection.findOne({ sectionId: idOrSectionId })
                .populate('gameId', 'name title')
                .populate('serviceId', 'title')
                .populate('categoryId', 'name');
        }

        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Section not found'
            });
        }

        res.status(200).json({
            success: true,
            data: section
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new custom section
// @route   POST /api/v1/custom-sections
// @access  Private/Admin
exports.createSection = async (req, res, next) => {
    try {
        const { title, sectionId, subheading, description, sectionType, fields, settings, gameId, serviceId, categoryId, status, displayOrder, seo } = req.body;

        // Validate required fields
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        // Check if sectionId already exists
        if (sectionId) {
            const existing = await CustomSection.findOne({ sectionId: sectionId.toLowerCase() });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    error: 'Section ID already exists'
                });
            }
        }

        const section = await CustomSection.create({
            title,
            sectionId: sectionId || undefined,
            subheading: subheading || '',
            description: description || '',
            sectionType: sectionType || 'custom',
            fields: fields || [],
            settings: settings || {},
            gameId: gameId || undefined,
            serviceId: serviceId || undefined,
            categoryId: categoryId || undefined,
            status: status || 'active',
            displayOrder: displayOrder || 0,
            seo: seo || {},
            createdBy: req.user?.id
        });

        res.status(201).json({
            success: true,
            data: section
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update custom section
// @route   PUT /api/v1/custom-sections/:id
// @access  Private/Admin
exports.updateSection = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if section exists
        const existingSection = await CustomSection.findById(id);
        if (!existingSection) {
            return res.status(404).json({
                success: false,
                error: 'Section not found'
            });
        }

        // Check if new sectionId already exists (if changing)
        if (updates.sectionId && updates.sectionId !== existingSection.sectionId) {
            const existing = await CustomSection.findOne({ sectionId: updates.sectionId.toLowerCase() });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    error: 'Section ID already exists'
                });
            }
        }

        // Add updatedBy
        updates.updatedBy = req.user?.id;

        const section = await CustomSection.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: section
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete custom section
// @route   DELETE /api/v1/custom-sections/:id
// @access  Private/Admin
exports.deleteSection = async (req, res, next) => {
    try {
        const { id } = req.params;

        const section = await CustomSection.findById(id);
        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Section not found'
            });
        }

        await CustomSection.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Section deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle section status
// @route   PATCH /api/v1/custom-sections/:id/status
// @access  Private/Admin
exports.toggleStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const section = await CustomSection.findById(id);
        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Section not found'
            });
        }

        if (status && !['active', 'inactive', 'draft'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        section.status = status || (section.status === 'active' ? 'inactive' : 'active');
        section.updatedBy = req.user?.id;
        await section.save();

        res.status(200).json({
            success: true,
            data: section
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reorder sections
// @route   PATCH /api/v1/custom-sections/reorder
// @access  Private/Admin
exports.reorderSections = async (req, res, next) => {
    try {
        const { sections } = req.body;

        if (!sections || !Array.isArray(sections)) {
            return res.status(400).json({
                success: false,
                error: 'Sections array is required'
            });
        }

        // Update display order for each section
        const bulkOps = sections.map((sectionId, index) => ({
            updateOne: {
                filter: { _id: sectionId },
                update: { displayOrder: index }
            }
        }));

        await CustomSection.bulkWrite(bulkOps);

        const updatedSections = await CustomSection.find()
            .sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            data: updatedSections
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get sections by game
// @route   GET /api/v1/custom-sections/game/:gameId
// @access  Public
exports.getSectionsByGame = async (req, res, next) => {
    try {
        const { gameId } = req.params;

        const sections = await CustomSection.find({
            gameId,
            status: 'active',
            $or: [
                { 'settings.isVisible': { $ne: false } },
                { 'settings.isVisible': { $exists: false } }
            ]
        })
            .populate('gameId', 'name title')
            .sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            data: sections
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get sections by service
// @route   GET /api/v1/custom-sections/service/:serviceId
// @access  Public
exports.getSectionsByService = async (req, res, next) => {
    try {
        const { serviceId } = req.params;

        const sections = await CustomSection.find({
            serviceId,
            status: 'active',
            $or: [
                { 'settings.isVisible': { $ne: false } },
                { 'settings.isVisible': { $exists: false } }
            ]
        })
            .populate('serviceId', 'title')
            .sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            data: sections
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Duplicate a section
// @route   POST /api/v1/custom-sections/:id/duplicate
// @access  Private/Admin
exports.duplicateSection = async (req, res, next) => {
    try {
        const { id } = req.params;

        const original = await CustomSection.findById(id);
        if (!original) {
            return res.status(404).json({
                success: false,
                error: 'Section not found'
            });
        }

        // Create duplicate data
        const duplicateData = original.toObject();
        delete duplicateData._id;
        delete duplicateData.createdAt;
        delete duplicateData.updatedAt;
        duplicateData.title = `${duplicateData.title} (Copy)`;
        duplicateData.sectionId = `${duplicateData.sectionId}-copy-${Date.now()}`;
        duplicateData.status = 'draft';
        duplicateData.createdBy = req.user?.id;
        duplicateData.updatedBy = undefined;

        const duplicate = await CustomSection.create(duplicateData);

        res.status(201).json({
            success: true,
            data: duplicate
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Export sections
// @route   GET /api/v1/custom-sections/export
// @access  Private/Admin
exports.exportSections = async (req, res, next) => {
    try {
        const sections = await CustomSection.find()
            .populate('gameId', 'name title')
            .populate('serviceId', 'title')
            .populate('categoryId', 'name')
            .sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            data: sections,
            exportCount: sections.length
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Import sections
// @route   POST /api/v1/custom-sections/import
// @access  Private/Admin
exports.importSections = async (req, res, next) => {
    try {
        const { sections } = req.body;

        if (!sections || !Array.isArray(sections)) {
            return res.status(400).json({
                success: false,
                error: 'Sections array is required'
            });
        }

        const imported = [];
        const errors = [];

        for (const sectionData of sections) {
            try {
                // Generate new sectionId if it conflicts
                const existing = await CustomSection.findOne({ sectionId: sectionData.sectionId });
                if (existing) {
                    sectionData.sectionId = `${sectionData.sectionId}-import-${Date.now()}`;
                }

                sectionData.status = sectionData.status || 'draft';
                sectionData.createdBy = req.user?.id;

                const section = await CustomSection.create(sectionData);
                imported.push(section);
            } catch (err) {
                errors.push({
                    section: sectionData.title || sectionData.sectionId,
                    error: err.message
                });
            }
        }

        res.status(201).json({
            success: true,
            data: {
                imported: imported.length,
                errors: errors.length > 0 ? errors : undefined,
                sections: imported
            }
        });
    } catch (error) {
        next(error);
    }
};
