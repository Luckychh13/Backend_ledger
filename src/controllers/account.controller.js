const accountModel = require("../models/account.model")
const {asyncHandler} = require("../utils/async-handler")
const {ApiResponse} = require("../utils/api-response")
const {ApiError} = require("../utils/api-error")

const createAccountController = asyncHandler(async function (req,res) {
    const user = req.user

    const account = await accountModel.create({
        user:user._id
    })

    return res
     .status(201)
     .json(new ApiResponse(
        201,
        account
     ))
})

const getUserAccountsController = asyncHandler(async function(req,res){

    const accounts = await accountModel.find({user: req.user._id})

    return res
     .status(200)
     .json(new ApiResponse(
        200,
        accounts,
        "User accounts fetched successfully"
     ))
})

const getAccountBalanceController = asyncHandler(async function(req,res){
    const {accountId} = req.params
    if(!accountId){
        throw new ApiError(400,"Invalid account accountId")
    }
    const account = await accountModel.findOne({
        _id:accountId,
        user:req.user._id
    })
    if(!account){
        throw new ApiError(404,"Account does not exists")
    }

    const balance = await account.getBalance();

    return res
     .status(200)
     .json(new ApiResponse(
        200,
        balance,
        "User account balance fetched successfully"
    ))

})

module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController
}