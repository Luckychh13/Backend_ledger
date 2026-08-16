const userModel = require("../models/user.model.js")
const jwt = require("jsonwebtoken")
const {ApiError}= require("../utils/api-error.js")
const {ApiResponse} = require("../utils/api-response.js")
const {asyncHandler} = require("../utils/async-handler.js")
const emailService = require("../services/email.service.js")
const tokenBlackListModel = require("../models/blackList.model.js")

/**
 * - user register controller
 * - POST /api/auth/register
 */
const userRegisterController = asyncHandler(async function (req,res){
    const {email,name,password} = req.body

    const isExists = await userModel.findOne({
        email:email
    })
    if(isExists){
        return res
         .status(422)
         .json(new ApiResponse(
            422,
            null,
            "User already exists with this email"
         ))
    }

    const user = await userModel.create({
        email, password, name
    })

    const token =jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})

    res.cookie("token",token)
    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })

    await emailService.sendRegistrationEmail(user.email, user.name)
    
})

/**
 * - user Login Controller
 * - Post /api/auth/login
 */
const userLoginController = asyncHandler(async function (req,res) {
    const { email, password } = req.body

    const user = await userModel.findOne({
        email
    }).select("+password")
    if(!user){
       throw new ApiError(401,"Email or Password is Invalid")
    }

    const isValidPassword = await user.comparePassword(password)
    if(!isValidPassword){
        throw new ApiError(401,"Email or Password is Invalid")
    }

    const token =jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})

    res.cookie("token",token)
    res.status(200).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })

    
})

/**
 * - user Logout Controller
 * - Post /api/auth/logout
 */
const userLogoutController = asyncHandler(async function (req,res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]
    if(!token){
        throw new ApiError(400,"Unauthorized access , Token is missing")
    }

    res.clearCookie("token")

    await tokenBlackListModel.create({
        token:token
    })

    return res
     .status(200)
     .json(new ApiResponse(
        200,
        {},
        "User logout successfully"
     ))

})


module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}