const {z} = require('zod')

const createTranscationSchema = z.object({
    fromAccount:z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ObjectId format" }),
    toAccount:z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ObjectId format" }),
    amount:z.number()
  .positive({ message: "Amount must be greater than 0" }),
    idempotencyKey:z.string().min(10)
})

const initialFundsSchema = z.object({
    toAccount:z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ObjectId format" }), 
    amount:z.number()
  .positive({ message: "Amount must be greater than 0" }), 
    idempotencyKey:z.string().min(10)
})

const accountIdParamSchema = z.object({
    accountId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ObjectId format" })
})


module.exports = {initialFundsSchema, createTranscationSchema, accountIdParamSchema}