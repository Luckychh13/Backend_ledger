const express = require("express")
const authController = require("../controllers/auth.controller.js")
const {validate} = require('../middleware/validate.middleware.js')
const {authLimiter, recoveryLimiter, forgetPasswordLimiter} = require('../middleware/rateLimiter.middleware.js')
const {registerSchema, loginSchema, forgetPasswordSchema, resetPasswordSchema, verificationSchema} = require('../validators/auth.validators.js')
const router = express.Router()


router.post("/register",authLimiter,validate(registerSchema),authController.userRegisterController)
router.post("/login",authLimiter,validate(loginSchema),authController.userLoginController)
router.post("/logout",authController.userLogoutController)
router.post("/forget-password",forgetPasswordLimiter,validate(forgetPasswordSchema),authController.userForgetPasswordController)
router.post("/reset-password",recoveryLimiter,validate(resetPasswordSchema),authController.userPasswordResetController)
router.post("/verify-email",recoveryLimiter,validate(verificationSchema),authController.userEmailVerificationController)

module.exports = router