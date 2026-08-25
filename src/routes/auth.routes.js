const express = require("express")
const authController = require("../controllers/auth.controller.js")
const {validate} = require('../middleware/validate.middleware.js')
const {registerSchema, loginSchema, forgetPasswordSchema, resetPasswordSchema, verificationSchema} = require('../validators/auth.validators.js')
const router = express.Router()


router.post("/register",validate(registerSchema),authController.userRegisterController)
router.post("/login",validate(loginSchema),authController.userLoginController)
router.post("/logout",authController.userLogoutController)
router.post("/forget-password",validate(forgetPasswordSchema),authController.userForgetPasswordController)
router.post("/reset-password",validate(resetPasswordSchema),authController.userPasswordResetController)
router.post("/verify-email",validate(verificationSchema),authController.userEmailVerificationController)

module.exports = router