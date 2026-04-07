require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');
const securityConfig = require('./config/security');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./config/logger');

const gameRoutes = require('./routes/games');
const serviceRoutes = require('./routes/services');
const offerRoutes = require('./routes/offers');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const blogRoutes = require('./routes/blogRoutes');
const userRoutes = require('./routes/users');
const payoutRoutes = require('./routes/payouts');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const proRoutes = require('./routes/pro');
const affiliateRoutes = require('./routes/affiliate');
const adminProRoutes = require('./routes/adminPro');
const promoCodeRoutes = require('./routes/promoCodes');
const customOrderRoutes = require('./routes/customOrders');
const categoryRoutes = require('./routes/categories');
const reviewRoutes = require('./routes/reviews');
const supportRoutes = require('./routes/support');
const currencyRoutes = require('./routes/currencies');
const accountRoutes = require('./routes/accounts');
const uploadRoutes = require('./routes/uploads');
const customSectionRoutes = require('./routes/customSections');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

securityConfig(app);

const corsOptions = {
    origin: (origin, callback) => {
       
        if (!origin) return callback(null, true);

   
        const allowedOrigins = [
            process.env.CORS_ORIGIN,
            'http://153.92.209.177:8080', 
            'http://localhost:5173',      
        ];

        if (allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:'))) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
});

const { checkMaintenance } = require('./middleware/maintenance');
app.use(checkMaintenance);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/games', gameRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/offers', offerRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/payouts', payoutRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/pro', proRoutes);
app.use('/api/v1/affiliate', affiliateRoutes);
app.use('/api/v1/admin/pros', adminProRoutes);
app.use('/api/v1/promo', promoCodeRoutes);
app.use('/api/v1/admin/promo', promoCodeRoutes);
app.use('/api/v1/custom-orders', customOrderRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/currencies', currencyRoutes);
app.use('/api/v1/currency', currencyRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/account', accountRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/custom-sections', customSectionRoutes);


app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.use(notFound);

app.use(errorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
});

const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

require('./socket').init(server);

module.exports = app;
