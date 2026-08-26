const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req, res) => {
    // Normalize IP using helper, then combine with email
    const ip = ipKeyGenerator(req, res);
    const email = req.body.email || "unknown";
    return `${ip}-${email}`;
  },
  handler: (req, res, next, options) => {
    console.log(`[RateLimit] Blocked request:
      IP: ${req.ip}
      Email: ${req.body.email}
      Path: ${req.originalUrl}
      Time: ${new Date().toISOString()}
    `);

    res.status(options.statusCode).json({
      error: options.message || "Too many requests"
    });
  },
  message: "Too many login attempts for this account. Please try again later."
});



// Forget-password limiter 
const forgetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many password reset requests. Please wait before trying again."
});

// Recovery limiter 
const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many recovery requests. Please try again later."
});



module.exports = {authLimiter, recoveryLimiter, forgetPasswordLimiter}
