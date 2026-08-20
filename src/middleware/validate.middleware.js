const { ApiError } = require("../utils/api-error")

const validate = (schema, target='body') => {
    return (req,res,next) => {
        const result = schema.safeParse(req[target])

        if(result.success){
            next()
        }else{
            throw new ApiError(400,"Validation Failed",result.error.issues.map(issue => issue.message))
        
           
        }
    }
}

module.exports= {validate}