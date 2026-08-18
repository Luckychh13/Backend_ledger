const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const emailService = require("../services/email.service")
const { ApiResponse } = require("../utils/api-response.js")
const { asyncHandler } = require("../utils/async-handler.js")
const { ApiError } = require("../utils/api-error.js")
const accountModel = require("../models/account.model.js")
const mongoose = require("mongoose")


const createTransaction = asyncHandler(async function (req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!fromUserAccount || !toUserAccount) {
        throw new ApiError(400, "Invalid fromAccount or ToAccount")
    }

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "COMPLETE") {
            return res.status(200).json(new ApiResponse(
                200,
                isTransactionAlreadyExists,
                "Transaction already processed"
            ))
        }

        if (isTransactionAlreadyExists.status === "PENDING") {
            return res.status(200).json(new ApiResponse(
                200,
                {},
                "Transaction is still processing"
            ));
        }

        if (isTransactionAlreadyExists.status === "FAILED") {
            throw new ApiError(500, "Transaction processing failed, please retry");
        }

        if (isTransactionAlreadyExists.status === "REVERSED") {
            throw new ApiError(500, "Transaction was reversed, please retry");
        }
    }

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        throw new ApiError(500, "Both fromAccount and toAccount must be active to process transaction");
    }


    const balance = await fromUserAccount.getBalance()
    if (balance < amount) {
        throw new ApiError(400, "Insufficient balance");
    }

    let transaction
    try {
        const session = await mongoose.startSession()
        session.startTransaction()
    
        transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status:"PENDING"
        }],{session}))[0]
    
        const debitLedgerEntry = await ledgerModel.create([{
            account:fromAccount,
            amount:amount,
            transaction:transaction._id,
            type:"DEBIT"
        }],{session})
    
        await new Promise((resolve) => setTimeout(resolve, 15 * 1000));

    
        const creditLedgerEntry = await ledgerModel.create([{
            account:toAccount,
            amount:amount,
            transaction:transaction._id,
            type:"CREDIT"
        }],{session})
    
        await transactionModel.findByIdAndUpdate(
            {_id: transaction._id},
            {status:"COMPLETE"},
            {session}
        )
    
        await session.commitTransaction()
        session.endSession()
    } catch (error) {
        throw new ApiError(400,"Transaction is pending due to some issue, please retry after sometime")
    }

    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)

    return res
     .status(201)
     .json(new ApiResponse(
        201,
        transaction,
        "Transaction processed successfully"
    ))

})

const createInitialFundsTransaction = asyncHandler(async function (req,res) {
    const {toAccount, amount, idempotencyKey} = req.body

    if(!toAccount || !amount || !idempotencyKey){
        throw new ApiError(400,"toAccount,amount,idempotencyKey are required")
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        throw new ApiError(400, "Invalid ToAccount")
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if(!fromUserAccount){
        throw new ApiError(400,"System user account not found")
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount:fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account:fromUserAccount._id,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT"
    }],{session})

    const creditLedgerEntry = await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT"
    }],{session})

    transaction.status = "COMPLETE"
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)

    return res
     .status(201)
     .json(new ApiResponse(
        201,
        transaction,
        "Initial funds transaction completed successfully"
    ))

})

module.exports = {
    createTransaction,
    createInitialFundsTransaction
}