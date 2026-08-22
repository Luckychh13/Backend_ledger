const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")
const { validate } = require("../middleware/validate.middleware")
const { accountIdParamSchema } = require("../validators/transacation.validators")

const router = express.Router()


/**
 * - POST /api/accounts/
 * - Create a new Account
 * - Protected Route
 */
router.route("/").post(authMiddleware.authMiddleware, accountController.createAccountController)

/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user
 * - Protected Route
 */
router.get("/",authMiddleware.authMiddleware,accountController.getUserAccountsController)

/**
 * - GET /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId",validate(accountIdParamSchema, "params") ,authMiddleware.authMiddleware, accountController.getAccountBalanceController)


module.exports = router