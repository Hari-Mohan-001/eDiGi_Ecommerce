const jwt = require("jsonwebtoken")
const user = require("../model/userModel")
const {decode} = require("jsonwebtoken")

const tokenVerify = async(req,res,next)=>{
    try {                                  
        const token = req.cookies.jwt
        if(token){
            await jwt.verify(token , process.env.JWT_SECRET , (err , decodedToken)=>{
                if(err){
                    console.log(err);
                    res.redirect("/login")
                }else{
                    console.log(decodedToken);
                    return next()
                }
            })                       
        
        }else{
            console.log("redirected");
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error.message);
    }

}

const isLogout = async(req,res,next)=>{
    try {                                  
        const token = req.cookies.jwt
        if(!token){
            return next()
        }else{
            jwt.verify(token , process.env.JWT_SECRET , (err , decoded)=>{
                if(err){
                    console.log(err);
                }else{
                    res.redirect("/home")
                }
            })
        }
            
      
    } catch (error) {
        console.log(error.message);
    }

}

const isBlocked = async(req,res, next)=>{
    try {
        const userId = decode(req.cookies.jwt).id
    const User = await user.findById({_id:userId})
    if(User.blocked === true){
        res.cookie("jwt", "", { maxAge: 1 });
        res.redirect("/login")
    }else{
        return next()
    }

    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    tokenVerify, 
    isLogout,
    isBlocked
}