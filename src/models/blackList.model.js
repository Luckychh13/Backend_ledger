const mongoose = require("mongoose")

const tokenBlackListSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required to blacklist"],
        unique: [true, "Token is already blackListed"]
    }
}, {
    timestamps: true
})

tokenBlackListSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 60 * 60 * 24 * 3
})

const tokenBlackListModel = mongoose.model("tokenBlackList",tokenBlackListSchema)
module.exports = tokenBlackListModel