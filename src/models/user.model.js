const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required for creating a user"],
        trim:true,
        lowercase:true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"Invalid email address"],
        unique:[true,"Email already exists"]
    },
    name:{
        type:String,
        required:[true,"Name is required for creating an account"]
    },
    password:{
        type:String,
        required:[true,"Password is required for creating an account"],
        minlength:[6,"Password should contain more than 6 character"],
        select:false
    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false
    },
    resetToken:{
        type:String,
        select:false,
    },
    resetTokenExpiry:{
        type:Date,
        select:false
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    verifiedCode:{
        type:String,
        select:false
    },
    verifiedCodeExpiry:{
        type:Date,
        select:false
    }
},{
    timestamps:true
})

userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        return 
    }

    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash

    return 
})

userSchema.methods.comparePassword=async function(password){
    
    
    return await bcrypt.compare(password,this.password)
  
}

userSchema.methods.compareResetToken = async function(resetToken){
    return await bcrypt.compare(resetToken,this.resetToken)
}

userSchema.methods.compareVerificationCode = async function (verifiedCode) {
    return await bcrypt .compare(verifiedCode, this.verifiedCode)
}

const userModel = mongoose.model("user",userSchema)

module.exports = userModel