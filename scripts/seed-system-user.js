require('dotenv').config()

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const userModel = require('../src/models/user.model');


async function call() {
    try {
        await connectDB()
        console.log("script connected");
        const user = await userModel.findOne({
            systemUser:true
        })
        if(user){
            console.log("System user already exists");
            
            
        }else{
                const user = await userModel.create({
                    email: process.env.SYSTEM_EMAIL,
                    password: process.env.SYSTEM_PASSWORD, 
                    name: process.env.SYSTEM_NAME,
                    systemUser: true
                })  
                console.log("New user created Successfully");
                
            }
    } catch (error) {
        console.error("Connection Error:",error);
        process.exitCode = 1;
        
    }finally{
        await mongoose.disconnect()
    }
}

call().catch((error) => {
    console.error("Seed script Error:", error);
    process.exitCode = 1;
})





