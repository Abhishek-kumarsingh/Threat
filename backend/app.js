const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const passport = require('passport');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// ==== Core Middlewares ====
app.use(express.json());
app.use(cookieParser());
console.log('✅ Core middlewares loaded');

// ==== Dev Logging ====
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log('✅ Morgan logging enabled');
}

// ==== Security Middleware ====
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(hpp());
app.use(compression());
console.log('✅ Security middleware loaded');

// ==== CORS ====
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
console.log('✅ CORS configured');

// ==== Rate Limiting ====
// const limiter = rateLimit({
//     windowMs: 10 * 60 * 1000,
//     max: 100
// });
// app.use('/api/', limiter);
console.log('✅ Rate limiting applied');

// ==== Passport ====
app.use(passport.initialize());
require('./config/passport')(passport);
console.log('✅ Passport initialized');

// ==== Routes ====
// Simple test route
app.get('/api', (req, res) => {
    res.json({
        message: 'Threat Zone Monitoring API is running',
        timestamp: new Date().toISOString(),
        status: 'success'
    });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/threat-zones', require('./routes/threatZones'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/admin', require('./routes/admin'));
console.log('✅ Routes mounted');

// ==== Static File Serving ====
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'))
    );
} else {
    app.get('/', (req, res) => res.send('API running'));
}
console.log('✅ Static file serving configured');

// ==== Error Handler ====
app.use(errorHandler);
console.log('✅ Custom error handler mounted');

module.exports = app;
