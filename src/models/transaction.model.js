const mongoose = require("mongoose")


const transactionSchema = new mongoose.Schema({
    
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Transcation must be associated with a from account"],
        index: true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Transcation must be associated with a to account"],
        index: true
    },
    status:{
        type:String,
        enum:{
            values:["PENDING","COMPLETE","FAILED","REVERSED" ],
            message:"Status can be either PENDING,COMPLETE,FAILED or REVERSED"
        },
        default:"PENDING"
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for creating a transcation "],
        min:[0,"Transcation amount cannot be negative"]
    },
    idempotencyKey:{
        type:String,
        required:[true,"Idempotency key is required for creating a transcation"],
        index:true,
        unique:true
    }

},{
    timestamps:true
})

const transactionModel = mongoose.model("transaction",transactionSchema)

module.exports = transactionModel