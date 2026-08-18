const { ApiError } = require("../utils/api-error")

const validate = (schema) => {
    return (req,res,next) => {
        const result = schema.safeParse(req.body)

        if(result.success){
            next()
        }else{
            throw new ApiError(400,"Validation Failed",result.error.issues.map(issue => issue.message))
        
           
        }
    }
}

module.exports= {validate}