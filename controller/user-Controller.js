const user = require("../model/userModel");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const mailer = require("../helpers/mailer");
const { decode } = require("jsonwebtoken")
const userHelper = require("../helpers/userHelper") 
const randomString = require("randomstring")
const product = require("../model/productModel")
const banner = require("../model/bannerModel")
const moment = require("moment")

let savedOtp, enteredName, enteredEmail, enteredMobile, enteredPassword, confirmPassword;

const generateOtp = () => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 5; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  console.log('reg otp'+otp);
  return otp;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: maxAge });
};

const home = async (req, res) => {
  let count = null  
  if(req.cookies.jwt){
   count = await  cartCount(decode(req.cookies.jwt).id)
  }
  const banners = await banner.find({isActive:true})
  const Product = await product.find({isBlocked:false});
  res.render("home" ,{products:Product , count , banners});
};



const loadRegister = async (req, res) => {
  let count = null  
  if(req.cookies.jwt){
   count = await  cartCount(decode(req.cookies.jwt).id)
  }
  res.render("registration",{count});
};

const sendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("registration", {
        success: false,
        msg: "errors",
        errors: errors.array(),
      });
    }

    enteredName = req.body.name;
    enteredEmail = req.body.email;
    enteredMobile = req.body.mobile;
    enteredPassword = req.body.password;
    confirmPassword = req.body.confirmPassword
  
    if(enteredPassword === confirmPassword){

    const findUser = await user.findOne({ email: enteredEmail , mobile:enteredMobile});
    if (!findUser) {
      savedOtp = generateOtp();
      const msg = `The otp for verificaion is ${savedOtp}.`;
      mailer.sendMail(enteredEmail, "otp verification", msg);
      res.render("verify-otp");
    } else {
      res.render("registration", { message: "User Already Exist" });
    }
  }else{
    res.render("registration" ,{message:"Password does'nt match"})
  }
  } catch (error) {
    console.log(error.message);
  }
};

const resendOtp = async(req,res)=>{
  try { 
     
    savedOtp = generateOtp();
    const msg = `The otp for verificaion is ${savedOtp}.`;
    mailer.sendMail(enteredEmail, "otp verification", msg);
    res.render("verify-otp" ,{message:'otp send to mail'});
    
  } catch (error) {
    console.log(error.message);
  }
}

const verifyOtp = async(req,res)=>{
  try {
    res.render("verify-otp")
  } catch (error) {
    console.log(error.message);
  }
}

const createUser = async (req, res) => {
  try {
    const enteredOtp = req.body.otp;
    if (enteredOtp === savedOtp) {
      

      const User = new user({
        name: enteredName,
        email: enteredEmail,
        mobile: enteredMobile,
        password: enteredPassword,
      });
      const userData = await User.save(); //create new user

      if (userData) {
        const token = createToken(userData._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
     
      res.redirect("/categories");
        
      } else {
        res.render("registration", { message: "Registration Failed" });
      }
    } else {
      res.render("registration", { message: "Registration Failed" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    console.log("login");

   return res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const finduser = await user.findOne({ email });
    if (finduser && (await finduser.isPasswordMatched(password))) {
      if (finduser.blocked === true) {
        res.render("login", { message: "You are Blocked by admin" });
      }
      const token = createToken(finduser._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
     
      res.redirect("/userDashboard");
    } else { 
      res.render("login", { message: "inavlid details" });  
    }
  } catch (error) {
    console.log(error.message);
  }
};

const uploadProfileimage = async(req,res ,next)=>{
  try {
    const userId = decode(req.cookies.jwt).id
    const findUser = await user.findById({_id:userId})
    const file = req.file
    findUser.profileImage = file.filename
  const updatedUser =   await findUser.save()
  if(updatedUser){
    return res.json({'success':true})
  }

  } catch (error) {
    next(error)
  }
}

const loadChangePassword = async(req,res)=>{
  try {
    let count = null  
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
    res.render("changePassword" ,{count})
  } catch (error) {
    console.log(error.message);
  }
}

const changePassword = async(req,res)=>{
  try {
    const userId = decode(req.cookies.jwt).id
    const findUser = await user.findById({_id:userId})
    const currentPassword = req.body.currentPassword
    const newPassword = req.body.newPassword
    if(findUser && await(findUser.isPasswordMatched(currentPassword))){
      const newHashPassword = await userHelper.securePassword(newPassword)
      console.log(findUser);
      const updatedUser = await user.findByIdAndUpdate({_id:userId},
        {
          $set:{password:newHashPassword}
        }
      );
      res.render("changePassword", {message:"Password changed successfully"})
    }else{
      res.render("changePassword",{message:"password does'nt match"})
    }
  } catch (error) {
    console.log(error.message);
  }
}

const loadforgetPassword = async(req,res)=>{
  try {
    console.log('forget');
    let count = null  
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
    
    res.render("forgetPassword", {count})
  } catch (error) {
    console.log(error.message);
  }
}

const sendPasswordResetMail = async(req,res)=>{
  try {
    const email = req.body.email
    const userData = await user.findOne({email:email})
    if(userData){
           if(userData.blocked === true){
            res.render("forgetPassword" , {message:"You are blocked by admin"})
           }else{
            const tokenString = randomString.generate()
            const updatedUser = await user.updateOne({email:email},
              {
                $set:{
                  token:tokenString
                }
              }
              )

              const msg = `Hello ${userData.name} Please click <a href=" http://localhost:5000/resetPassword?token=${tokenString}">here</a> to reset your password `;
              mailer.sendResetPasswordMail(email, "Reset Password", msg , tokenString , userData.name);
              res.render("forgetPassword" , {message:"An email has been send to you , please verify it"})
            }
    }else{
      res.render("forgetPassword" , {message:"Invalid Email"})
    }
  } catch (error) {
    console.log(error.message);
  }
}

const loadResetPassword = async(req,res)=>{
  try {
    let count = null  
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
    const token = req.query.token
    const tokenVerify = await user.findOne({token:token})
    if(tokenVerify){
          res.render("resetPassword", {userId:tokenVerify._id , count})
    }else{
      res.render("404", {message:"Token Invalid" , count})
    }
  } catch (error) {
    console.log(error.message); 
  }
}

const resetPassword = async(req,res)=>{
  try {
        const UserId = req.body.userId
        console.log(UserId);
        const password =req.body.password
        const confirmPassword =  req.body.confirmPassword
        if(password===confirmPassword){
        const hashPassword =await userHelper.securePassword(confirmPassword)
          const userdata = await user.findOneAndUpdate({_id:UserId},
            {
              $set:{
                password:hashPassword,  
                token:""
              }
            }
            )
            console.log("reset");
            res.render("resetPassword",{ userId:UserId ,message:"Password reset successfull"})
        }else{
          res.render("resetPassword" ,{userId:UserId,  message:"Password does'nt match"})
        }
        

        

  } catch (error) {
    console.log(error.message);
  }
}

const logout = async (re, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

const loadUserDashboard = async(req,res)=>{
  try {
    let count = null  
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
  
    const userId = decode(req.cookies.jwt).id
    const User = await user.findById({_id:userId})
   
     res.render("userDashboard",{users:User , count , })
  } catch (error) {
    console.log(error.message);
  }
}

const loadAddress = async(req,res)=>{
  try {
    let count = null  
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
    const userId = decode(req.cookies.jwt).id
    const User = await user.findById({_id:userId})

    res.render("address" , { address:User.address, users:User,count})
  } catch (error) {
    console.log(error.message);
  }
}

const loadAddNewAddress = async(req,res)=>{
  try {
    let count = null  
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
    res.render("addNewAddress",{count})
  } catch (error) {
    console.log(error.message);
  }
}

const addNewAddress = async(req,res)=>{
  try {
    const userId = decode(req.cookies.jwt).id
    const User = await user.findByIdAndUpdate({_id:userId},
      {
        $addToSet:{
          address:req.body
        }
      }
      ) 

      res.redirect("/address")
  } catch (error) {
    console.log(error.message);
  }
}

const loadEditAddress = async(req,res)=>{
  try {
    let count = null  
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
    const userId = decode(req.cookies.jwt).id
    const addressId = req.query.id
    const findAddress = await user.findOne({address:{$elemMatch:{_id:addressId}}},
      {"address.$":1 , _id:0}
      )
      console.log(findAddress);
    res.render("editAddress",{address:findAddress , count})
  } catch (error) {
    console.log(error.message);
  }
}

const editAddress = async(req,res)=>{
  try {
    const addressId = req.body.id
    console.log("edit route");
    const findAddress = await user.updateOne({address:{$elemMatch:{_id:addressId}}},
      {
        $set:{
          "address.$":req.body
        }
      }
      )
      res.redirect("/address")
  } catch (error) {
    console.log(error.message); 
  }
}

const deleteAddress = async(req,res)=>{
  try {
    const addressId = req.query.id
    const userId = decode(req.cookies.jwt).id
    const deleteAddress = await user.findByIdAndUpdate({_id:userId},
      {
        $pull:{
          address:{
            _id:addressId
          }
        }
      }
      )
      res.redirect("/address")
  } catch (error) {
    console.log(error.message);
  }
}

const notFound = async(req,res)=>{
  try {
        res.render("notFound")
  } catch (error) {
    console.log(error.message);
  }
}

const loadEditProfile = async(req,res)=>{
  try {
    let count = null  
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
    const userId = decode(req.cookies.jwt).id
    const findUser = await user.findById({_id:userId})
        res.render("editProfile" ,{user:findUser , count})
  } catch (error) {
    console.log(error.message);
  }
}

const editProfile = async(req,res)=>{
  try {
    const userId = decode(req.cookies.jwt).id
        const updateUser = await user.findByIdAndUpdate({_id:userId},
          {
            $set:{
              name:req.body.name,
              mobile:req.body.mobile
            }
          }
          )
          

          res.redirect("/userDashboard")
  } catch (error) {
    console.log(error.message);
  }
}

const userWallet = async(req,res)=>{
  try {

    let count = null  
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }

  

    const userId = decode(req.cookies.jwt).id
    const User = await user.findById({_id:userId})
    
    const totalWallet = User.wallet
    let walletHistory = User.walletHistory
    walletHistory = walletHistory.map(walletHistory=>({
      ...walletHistory,
      walletDate:moment(walletHistory.date).format("DD/MM/YYYY")
    }))
     

    res.render("wallet" ,{totalWallet , walletHistory,moment, count})
  } catch (error) {
    console.log(error.message);
  }
}

const loadContacPage = async(req,res, next)=>{
  try {
    let count = null  
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }

    res.render("contactUs", {count})
  } catch (error) {
    next(error)
  }
}
 
module.exports = {
  
 home,loadRegister, sendOTP, verifyOtp,resendOtp,
  createUser,loginUser,
  loadLogin,logout,
  loadUserDashboard,
  loadChangePassword, changePassword,
  uploadProfileimage,
  loadforgetPassword,sendPasswordResetMail,
  loadResetPassword,resetPassword,
  loadAddress,
  loadAddNewAddress,addNewAddress,
   loadEditAddress, editAddress,deleteAddress,
   loadEditProfile,editProfile,userWallet,
   loadContacPage,
  notFound
};
