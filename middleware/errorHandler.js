//not found

const notFound = (req,res,next)=>{
    const error = new Error(`not found`)
    console.log("not found");
   res.render("notFound")
    // next(error)
}

//error handler

const errorHandler = (error , req, res, next)=>{
    const statusCode = res.statusCode == 200?500:res.statusCode
    // res.send(statusCode);
    
    console.log("error call");
    // res.sendStatus(statusCode)
    console.log(error);
    next() 
}

module.exports = {
    notFound,
    errorHandler
}