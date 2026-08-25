const userModel = require("../models/user.model.js")
const jwt = require("jsonwebtoken")
const {ApiError}= require("../utils/api-error.js")
const {ApiResponse} = require("../utils/api-response.js")
const {asyncHandler} = require("../utils/async-handler.js")
const emailService = require("../services/email.service.js")
const tokenBlackListModel = require("../models/blackList.model.js")
const crypto = require('crypto')
const bcrypt = require('bcrypt')

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

    const code = crypto.randomInt(100000, 1000000).toString()
    const hash = await bcrypt.hash(code,10)

    const expiryTime = Date.now() + 15*60*1000

    user.verifiedCode = hash
    user.verifiedCodeExpiry = expiryTime

    await user.save()

    await emailService.sendRegistrationEmail(user.email, user.name, code)

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})

    res.cookie("token",token)

    return res
     .status(201)
     .json(new ApiResponse(
        201,
        {
            user:{
                _id:user._id,
                email:user.email,
                name:user.name
            },
            token
        },
        "User registered successfully"
     ))
})

/**
 * - user Login Controller
 * - POST /api/auth/login
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
    
    const isVerifiedUser = user.isVerified
    if(!isVerifiedUser){
        throw new ApiError(403,"User not verified")
    }
    const token =jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})

    res.cookie("token",token)
    return res
     .status(200)
     .json(new ApiResponse(
        200,
        {
            user:{
                _id:user._id,
                email:user.email,
                name:user.name
            },
            token
        },
        "Login successful"
     ))
})

/**
 * - user Logout Controller
 * - POST /api/auth/logout
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

/**
 * - user Forget Password Controller
 * - POST /api/auth/forget-password
 */
const userForgetPasswordController = asyncHandler(async function (req,res) {
    const {email} = req.body

    const user = await userModel.findOne({
        email
    })
    if(!user){
        return res
         .status(200)
         .json(new ApiResponse(
            200,
            "Email verification code has been sent to your mail"
        ))
    }

    const buffer = crypto.randomBytes(16).toString('hex')
    const hash = await bcrypt.hash(buffer,10)
    const tokenExpiryTime = Date.now()+15*60*1000

    await userModel.findByIdAndUpdate(
        user._id,
        {
        
        resetToken:hash,
        resetTokenExpiry:tokenExpiryTime
    })

    await emailService.sendEmail(
        email,
        "Password rest Token",
        `This is youe ResetPasswordToken ${buffer}`
    )

    return res
     .status(200)
     .json(new ApiResponse(
        200,
        "Email verification code has been sent to your mail"
     ))
    
})

/**
 * - user Password Reset Controller
 * - POST /api/auth/reset-password
 */
const userPasswordResetController = asyncHandler(async function(req, res) {
    const {email, resetToken, newPassword} = req.body

    const user = await userModel.findOne({
        email
    }).select("+resetToken +resetTokenExpiry")

    if(!user){
        throw new ApiError(403,"Invalid email or verification code")
    }

    const isValidRestToken = await user.compareResetToken(resetToken)
    const isTokenExpired = Date.now() > user.resetTokenExpiry

    if(!isValidRestToken || isTokenExpired){
        throw new ApiError(400,"Invalid Verification Code")
    }

    user.password = newPassword
    user.resetToken = null
    user.resetTokenExpiry = null
    await user.save()

    return res
     .status(201)
     .json(new ApiResponse(
        201,
        "Password Rest Successfully"
    ))


})

/**
 *  - user Email Verification Controller
 *  - POST /api/auth/verify-email
 */
const userEmailVerificationController = asyncHandler(async function (req,res){
    const {verifiedCode, email} = req.body

    const user = await userModel.findOne({
        email
    }).select("+verifiedCode +verifiedCodeExpiry")

    if(!user){
        throw new ApiError(403,"Invalid Email or  Verfication Code")
    }

    const isVerified = await user.compareVerificationCode(verifiedCode)
    const isVerifiedTime = Date.now() > user.verifiedCodeExpiry

    if(!isVerified || isVerifiedTime){
        throw new ApiError(403,"Invalid Email or  Verfication Code")
    }

    user.isVerified = true
    user.verifiedCode = null
    user.verifiedCodeExpiry = null
    await user.save()

    return res
     .status(200)
     .json(new ApiResponse(
        200,
        null,
        "User verified Successfully"
     ))
})


module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController,
    userPasswordResetController,
    userForgetPasswordController,
    userEmailVerificationController
}