const AccountListing = require('../models/AccountListing');
const asyncHandler = require('express-async-handler');

// @desc    Get all account listings (public)
// @route   GET /api/v1/accounts
// @access  Public
const getAllAccountListings = asyncHandler(async (req, res) => {
    const {
        gameId, gameSlug, rankTier, region, server,
        minPrice, maxPrice, hasSkins, sortBy = 'displayOrder',
        page = 1, limit = 20
    } = req.query;

    const filter = { isActive: true, status: 'active' };
    if (gameId) filter.gameId = gameId;
    if (gameSlug) filter.gameSlug = gameSlug;
    if (rankTier) filter.rankTier = { $regex: rankTier, $options: 'i' };
    if (region && region !== 'Global') filter.region = region;
    if (server && server !== 'Any') filter.server = { $regex: server, $options: 'i' };
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (hasSkins === 'true') {
        filter['specifications.skinsCount'] = { $gt: 0 };
    }

    // Build sort
    let sort = {};
    if (sortBy === 'price_asc') sort = { price: 1 };
    else if (sortBy === 'price_desc') sort = { price: -1 };
    else if (sortBy === 'newest') sort = { createdAt: -1 };
    else sort = { isFeatured: -1, displayOrder: 1, createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AccountListing.countDocuments(filter);
    const listings = await AccountListing.find(filter)
        .populate('gameId', 'name slug icon')
        .sort(sort)
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

// @desc    Get account listings by game
// @route   GET /api/v1/accounts/game/:gameId
// @access  Public
const getAccountListingsByGame = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const { rankTier, minPrice, maxPrice } = req.query;

    const filter = { gameId, isActive: true, status: 'active' };
    if (rankTier) filter.rankTier = { $regex: rankTier, $options: 'i' };
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const listings = await AccountListing.find(filter)
        .populate('gameId', 'name slug icon')
        .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 });

    res.json({ success: true, count: listings.length, data: listings });
});

// @desc    Get a single account listing
// @route   GET /api/v1/accounts/:id
// @access  Public
const getAccountListing = asyncHandler(async (req, res) => {
    const listing = await AccountListing.findById(req.params.id)
        .populate('gameId', 'name slug icon banner');

    if (!listing) {
        res.status(404);
        throw new Error('Account listing not found');
    }
    res.json({ success: true, data: listing });
});

// @desc    Create an account listing (Admin)
// @route   POST /api/v1/accounts/admin
// @access  Admin
const createAccountListing = asyncHandler(async (req, res) => {
    if (req.body.gameId && !req.body.gameSlug) {
        const Game = require('../models/Game');
        const game = await Game.findById(req.body.gameId).select('slug');
        if (game) req.body.gameSlug = game.slug;
    }
    const listing = await AccountListing.create(req.body);
    res.status(201).json({ success: true, data: listing });
});

// @desc    Update an account listing (Admin)
// @route   PUT /api/v1/accounts/admin/:id
// @access  Admin
const updateAccountListing = asyncHandler(async (req, res) => {
    const listing = await AccountListing.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!listing) {
        res.status(404);
        throw new Error('Account listing not found');
    }
    res.json({ success: true, data: listing });
});

// @desc    Delete an account listing (Admin)
// @route   DELETE /api/v1/accounts/admin/:id
// @access  Admin
const deleteAccountListing = asyncHandler(async (req, res) => {
    const listing = await AccountListing.findByIdAndDelete(req.params.id);
    if (!listing) {
        res.status(404);
        throw new Error('Account listing not found');
    }
    res.json({ success: true, message: 'Account listing deleted' });
});

// @desc    Toggle active status (Admin)
// @route   PATCH /api/v1/accounts/admin/:id/status
// @access  Admin
const toggleAccountStatus = asyncHandler(async (req, res) => {
    const listing = await AccountListing.findById(req.params.id);
    if (!listing) {
        res.status(404);
        throw new Error('Account listing not found');
    }
    // Cycle: active → inactive → active (don't change 'sold')
    if (listing.status === 'sold') {
        res.status(400);
        throw new Error('Cannot toggle status of a sold account');
    }
    listing.isActive = !listing.isActive;
    listing.status = listing.isActive ? 'active' : 'inactive';
    await listing.save();
    res.json({ success: true, data: listing });
});

// @desc    Mark account as sold (Admin/Order system)
// @route   PATCH /api/v1/accounts/admin/:id/sold
// @access  Admin
const markAccountSold = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const listing = await AccountListing.findByIdAndUpdate(req.params.id, {
        status: 'sold',
        isActive: false,
        soldTo: userId,
        soldAt: new Date()
    }, { new: true });
    if (!listing) {
        res.status(404);
        throw new Error('Account listing not found');
    }
    res.json({ success: true, data: listing });
});

// @desc    Get all account listings for admin (including inactive/sold)
// @route   GET /api/v1/accounts/admin/all
// @access  Admin
const getAdminAccountListings = asyncHandler(async (req, res) => {
    const { gameId, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (gameId) filter.gameId = gameId;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AccountListing.countDocuments(filter);
    const listings = await AccountListing.find(filter)
        .populate('gameId', 'name slug icon')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    res.json({ success: true, count: listings.length, total, data: listings });
});

module.exports = {
    getAllAccountListings,
    getAccountListingsByGame,
    getAccountListing,
    createAccountListing,
    updateAccountListing,
    deleteAccountListing,
    toggleAccountStatus,
    markAccountSold,
    getAdminAccountListings
};
