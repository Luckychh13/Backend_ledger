const {ApiError} = require('../utils/api-error')


const errorMiddleware = (err, req, res, next) =>{
    if(err instanceof ApiError){
        res
         .status(err.statusCode)
         .json({
            success:err.success,
            message:err.message,
            data:err.data,
            errors:err.errors
         })
    }else{
        console.error(err)
        res
         .status(500)
         .json({
            success:false,
            message:'Internal server error',
            data:null,
            errors:[],
         })
    }
}

module.exports = {errorMiddleware}