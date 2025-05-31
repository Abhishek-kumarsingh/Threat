const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

module.exports = function (passport) {
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in the environment variables.");
        // process.exit(1); // Exiting to prevent running without the secret
    }

    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    };

    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.id);

            if (user) {
                return done(null, user);
            }

            return done(null, false);
        } catch (err) {
            console.error('Error in Passport JWT strategy:', err);
            return done(err, false);
        }
    }));
};
