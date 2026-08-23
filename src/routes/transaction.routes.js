const {Router} = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const transactionController = require("../controllers/transaction.controller.js")
const {validate} = require ('../middleware/validate.middleware.js')
const {initialFundsSchema, createTranscationSchema} = require('../validators/transacation.validators.js')
const transactionRoutes = Router();


/**
 * - POST /api/transaction
 * - Create a new Transaction
 */
transactionRoutes.post("/",validate(createTranscationSchema) ,authMiddleware.authMiddleware, transactionController.createTransaction)


/**
 * - POST /api/transaction/system/initial-funds
 * - Create initial funds transaction from system user
 */
transactionRoutes.post("/system/initial-funds",validate(initialFundsSchema) ,authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)







module.exports = transactionRoutes