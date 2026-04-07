const CurrencyListing = require('../models/CurrencyListing');
const asyncHandler = require('express-async-handler');

// @desc    Get all currency listings (public, with filters)
// @route   GET /api/v1/currency
// @access  Public
const getAllCurrencyListings = asyncHandler(async (req, res) => {
    const { gameId, gameSlug, currencyType, region, server, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true, status: 'active' };
    if (gameId) filter.gameId = gameId;
    if (gameSlug) filter.gameSlug = gameSlug;
    if (currencyType) filter.currencyType = { $regex: currencyType, $options: 'i' };
    if (region && region !== 'Global' && region !== 'Any') filter.region = region;
    if (server && server !== 'Any') filter.server = { $regex: server, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await CurrencyListing.countDocuments(filter);
    const listings = await CurrencyListing.find(filter)
        .populate('gameId', 'name slug icon')
        .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    res.json({
        success: true,
        count: listings.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        data: listings
    });
});

// @desc    Get currency listings by game
// @route   GET /api/v1/currency/game/:gameId
// @access  Public
const getCurrencyListingsByGame = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const { currencyType, region } = req.query;

    const filter = { gameId, isActive: true, status: 'active' };
    if (currencyType) filter.currencyType = { $regex: currencyType, $options: 'i' };
    if (region && region !== 'Any') filter.region = region;

    const listings = await CurrencyListing.find(filter)
        .populate('gameId', 'name slug icon')
        .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 });

    res.json({ success: true, count: listings.length, data: listings });
});

// @desc    Get a single currency listing
// @route   GET /api/v1/currency/:id
// @access  Public
const getCurrencyListing = asyncHandler(async (req, res) => {
    const listing = await CurrencyListing.findById(req.params.id)
        .populate('gameId', 'name slug icon banner');

    if (!listing) {
        res.status(404);
        throw new Error('Currency listing not found');
    }
    res.json({ success: true, data: listing });
});

// @desc    Calculate price for a quantity of currency
// @route   POST /api/v1/currency/calculate
// @access  Public
const calculateCurrencyPrice = asyncHandler(async (req, res) => {
    const { listingId, quantity } = req.body;

    if (!listingId || !quantity) {
        res.status(400);
        throw new Error('listingId and quantity are required');
    }

    const listing = await CurrencyListing.findById(listingId);
    if (!listing) {
        res.status(404);
        throw new Error('Currency listing not found');
    }

    if (quantity < listing.minQuantity || quantity > listing.maxQuantity) {
        res.status(400);
        throw new Error(`Quantity must be between ${listing.minQuantity} and ${listing.maxQuantity}`);
    }

    const price = CurrencyListing.calculatePrice(listing, quantity);
    res.json({ success: true, data: { price, quantity, pricePerUnit: listing.pricePerUnit } });
});

// @desc    Create a currency listing (Admin)
// @route   POST /api/v1/currency/admin
// @access  Admin
const createCurrencyListing = asyncHandler(async (req, res) => {
    // Auto-populate gameSlug if not provided
    if (req.body.gameId && !req.body.gameSlug) {
        const Game = require('../models/Game');
        const game = await Game.findById(req.body.gameId).select('slug');
        if (game) req.body.gameSlug = game.slug;
    }

    const listing = await CurrencyListing.create(req.body);
    res.status(201).json({ success: true, data: listing });
});

// @desc    Update a currency listing (Admin)
// @route   PUT /api/v1/currency/admin/:id
// @access  Admin
const updateCurrencyListing = asyncHandler(async (req, res) => {
    const listing = await CurrencyListing.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!listing) {
        res.status(404);
        throw new Error('Currency listing not found');
    }
    res.json({ success: true, data: listing });
});

// @desc    Delete a currency listing (Admin)
// @route   DELETE /api/v1/currency/admin/:id
// @access  Admin
const deleteCurrencyListing = asyncHandler(async (req, res) => {
    const listing = await CurrencyListing.findByIdAndDelete(req.params.id);
    if (!listing) {
        res.status(404);
        throw new Error('Currency listing not found');
    }
    res.json({ success: true, message: 'Currency listing deleted' });
});

// @desc    Toggle active status (Admin)
// @route   PATCH /api/v1/currency/admin/:id/status
// @access  Admin
const toggleCurrencyStatus = asyncHandler(async (req, res) => {
    const listing = await CurrencyListing.findById(req.params.id);
    if (!listing) {
        res.status(404);
        throw new Error('Currency listing not found');
    }
    listing.isActive = !listing.isActive;
    listing.status = listing.isActive ? 'active' : 'inactive';
    await listing.save();
    res.json({ success: true, data: listing });
});

// @desc    Get all currency listings for admin (including inactive)
// @route   GET /api/v1/currency/admin/all
// @access  Admin
const getAdminCurrencyListings = asyncHandler(async (req, res) => {
    const { gameId, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (gameId) filter.gameId = gameId;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await CurrencyListing.countDocuments(filter);
    const listings = await CurrencyListing.find(filter)
        .populate('gameId', 'name slug icon')
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    res.json({ success: true, count: listings.length, total, data: listings });
});

module.exports = {
    getAllCurrencyListings,
    getCurrencyListingsByGame,
    getCurrencyListing,
    calculateCurrencyPrice,
    createCurrencyListing,
    updateCurrencyListing,
    deleteCurrencyListing,
    toggleCurrencyStatus,
    getAdminCurrencyListings
};
