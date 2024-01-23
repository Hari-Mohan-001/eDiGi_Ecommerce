const express = require("express")
const { createUser,  loginUser,loadLogin, loadRegister, sendOTP, logout, loadUserDashboard, notFound, 
  loadChangePassword, changePassword, loadAddress, loadAddNewAddress, loadEditAddress, addNewAddress, editAddress, 
  deleteAddress,  loadEditProfile,editProfile,loadforgetPassword,
  sendPasswordResetMail,
  loadResetPassword,
  resetPassword,
  verifyOtp,
  resendOtp} = require("../controller/user-Controller")

const {loadProducts, loadCategories, loadSingleProduct , home}= require("../controller/product-Controller")

const { tokenVerify, isLogout , isBlocked } = require("../middleware/authMiddleware")

const {userValidator} = require("../helpers/Validation")

const { laodCart, addToCart, removeCartItem, quantityUpdation } = require("../controller/cart-Controller")

const { loadCheckout, createOrder, orderSuccess } = require("../controller/checkout-Controller")

const{viewOrders, orderDetails, cancelOrder, deleteInOrder} =require("../controller/order-Controller")

const { applyCoupon, removeCoupon } = require("../controller/coupon-Controller")

const { generateRazorpay, razorpayVerifyOrder, sample } = require("../helpers/razorpay")
const { addToWishlist, loadWishlist } = require("../controller/wishlistController")

const userRoute = express.Router()

userRoute.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    next();
  });


userRoute.get("/",home)
userRoute.get("/register",isLogout,loadRegister)
userRoute.post("/register",userValidator,sendOTP)
userRoute.get("/resendOtp" , resendOtp)
userRoute.get("/verify-otp" , verifyOtp)
userRoute.post("/verify-otp" ,createUser)
userRoute.post("/login", loginUser)
userRoute.get("/login",isLogout,loadLogin )
userRoute.get("/logout" , logout)
userRoute.get("/changePassword" , tokenVerify ,isBlocked, loadChangePassword)
userRoute.post("/changePassword" , changePassword) 

userRoute.get("/forgetPassword" ,isLogout,isBlocked, loadforgetPassword)
userRoute.post("/forgetPassword" ,sendPasswordResetMail)
userRoute.get("/resetPassword",isLogout,isBlocked, loadResetPassword )
userRoute.post("/resetPassword",resetPassword)


userRoute.get("/notFound", notFound)

userRoute.get("/userDashboard",tokenVerify,isBlocked, loadUserDashboard)
userRoute.get("/address" ,tokenVerify,isBlocked, loadAddress)
userRoute.get("/addNewAddress" ,tokenVerify,isBlocked, loadAddNewAddress)  
userRoute.post("/addNewAddress" , addNewAddress)
userRoute.get("/editAddress" ,tokenVerify,isBlocked, loadEditAddress)
userRoute.post("/editAddress" , editAddress)
userRoute.get("/deleteAddress",isBlocked, deleteAddress)

userRoute.get("/editProfile" ,tokenVerify,isBlocked, loadEditProfile)
userRoute.post("/editProfile",editProfile)

userRoute.get("/categories" , loadCategories)
userRoute.get("/products" ,loadProducts)

userRoute.get("/singleProduct", loadSingleProduct)

userRoute.get("/wishlist" , tokenVerify , loadWishlist)
userRoute.post("/addToWishlist", addToWishlist)

userRoute.get("/myCart",tokenVerify,isBlocked, laodCart)
userRoute.post("/addToCart",tokenVerify ,addToCart)
userRoute.post("/quantityUpdate" , quantityUpdation) 
userRoute.get("/removeItem" , removeCartItem)

userRoute.get("/checkout" ,tokenVerify,isBlocked, loadCheckout)
userRoute.post("/checkout" , createOrder)
userRoute.get("/orderSuccess" ,tokenVerify,isBlocked, orderSuccess)

userRoute.get("/orders" , tokenVerify,isBlocked,viewOrders)
userRoute.get("/orderDetails" ,tokenVerify,isBlocked, orderDetails)
userRoute.get("/cancelOrder" , cancelOrder)
userRoute.post("/deleteInOrder" , deleteInOrder)

userRoute.post("/applyCoupon" , applyCoupon)
userRoute.post("/removeCoupon" , removeCoupon)

userRoute.post("/create/orderId" , generateRazorpay)
userRoute.post("/api/payment/verify" , razorpayVerifyOrder)
userRoute.get("/sample" , sample)

module.exports =  userRoute   
 