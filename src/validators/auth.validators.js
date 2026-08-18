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


module.exports ={registerSchema, loginSchema}