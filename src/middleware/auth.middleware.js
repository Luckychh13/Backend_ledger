const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const {ApiError} = require("../utils/api-error")
const {asyncHandler} = require("../utils/async-handler")
const {ApiResponse} = require("../utils/api-response")
const tokenBlackListModel = require("../models/blackList.model")

const authMiddleware = asyncHandler( async function (req,res,next) {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]
    if(!token){
        throw new ApiError(401,"Unauthorized access , Token is missing")
    }

    const isBlackListed = await tokenBlackListModel.findOne({token})
    if(isBlackListed){
        throw new ApiError(401,"Unauthorised access, token is invalid")
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId)

        req.user = user

        next()

    } catch (error) {
        throw new ApiError(401,"Unauthorized access, Token is invalid")
    }

})

const authSystemUserMiddleware = asyncHandler(async function (req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]
    if(!token){
        throw new ApiError(401,"Unauthorized access , Token is missing")
    }

    const isBlackListed = await tokenBlackListModel.findOne({token})
    if(isBlackListed){
        throw new ApiError(401,"Unauthorised access, token is invalid")
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId).select("+systemUser")

        if(!user.systemUser){
            throw new ApiError(403,"Forbidden access, not a system user")
        }
        req.user = user

        next()

    } catch (error) {
        throw new ApiError(401,"Unauthorized access, Token is invalid")
    }
})

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}