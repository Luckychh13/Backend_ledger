const {ApiError} = require('../utils/api-error')

const Error404 = (req,res,next) => {
    throw new ApiError(404,"Route not found")
}

module.exports = {Error404}