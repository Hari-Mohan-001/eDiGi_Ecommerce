//not found

const notFound = (req,res,next)=>{
    const error = new Error(`not found`)
    console.log("not Found");
  return res.render("notFound")
   
}

//error handler

const errorHandler = (error , req, res, next)=>{
    const statusCode = res.statusCode === 200?500:res.statusCode
     res.render("notFound")
     console.log('eroor');
    console.log(error);
    next() 
}

module.exports = {
    notFound,
    errorHandler
}