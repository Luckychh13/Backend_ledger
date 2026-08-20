const {ApiError} = require('../utils/api-error')


const errorMiddleware = (err, req, res, next) =>{
    
    if(err.type === 'entity.parse.failed'){
        return res
         .status(err.statusCode)
         .json({
            success:false,
            message:"Invalid json in request body",
            data:null,
            errors:[]
         })
    }
    else if(err instanceof ApiError){
        return res
         .status(err.statusCode)
         .json({
            success:err.success,
            message:err.message,
            data:err.data,
            errors:err.errors
         })
    }else{
        console.error(err)
        return res
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