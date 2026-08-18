const express = require("express")
const authController = require("../controllers/auth.controller.js")
const {validate} = require('../middleware/validate.middleware.js')
const {registerSchema, loginSchema} = require('../validators/auth.validators.js')
const router = express.Router()


router.post("/register",validate(registerSchema),authController.userRegisterController)
router.post("/login",validate(loginSchema),authController.userLoginController)
router.post("/logout",authController.userLogoutController)

module.exports = router