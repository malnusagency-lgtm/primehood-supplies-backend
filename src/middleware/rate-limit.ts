import rateLimit from "express-rate-limit";

// General rate limiter: 1000 requests per 15 minutes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth rate limiter: 20 attempts per 15 minutes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "Too many login attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Upload rate limiter: 50 uploads per 15 minutes
export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: "Too many uploads, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});
