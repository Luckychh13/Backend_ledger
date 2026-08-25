const {z }= require('zod')


const registerSchema = z.object({
    email:z.string().email(),
    name:z.string().min(3).max(30),
    password:z.string().min(6).max(30)
})

const loginSchema = z.object({
    email:z.string().email(),
    password:z.string().min(6).max(30)
})

const forgetPasswordSchema = z.object({
    email:z.string().email()
})

const resetPasswordSchema = z.object({
    email:z.string().email(),
    newPassword:z.string().min(6).max(30),
    resetToken:z.string()
})

const verificationSchema = z.object({
    email:z.string().email(),
    verifiedCode:z.string()
})


module.exports ={registerSchema, loginSchema, forgetPasswordSchema, resetPasswordSchema, verificationSchema}