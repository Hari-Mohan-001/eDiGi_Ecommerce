const express = require("express")
const { getAllUsers, getSingleUser, loadAdminLogin, verifyLogin, loadAdminDashboard, loadCategoryList, loadAddCategory,
   addNewCategory, blockUser, loadProductList, loadAddProduct, unblockUser, addNewProduct, loadUpdateProduct, 
   updateProduct, logout, adminLogout, } = require("../controller/admin-Controller")
const {tokenVerify,isLogout} =require("../middleware/adminAuth") 
const upload = require("../middleware/multer")
const { adminOrderList, updateOrderStatus, adminAllOrders } = require("../controller/order-Controller")
const { loadEditCategory, editCategory, blockCategory } = require("../controller/category-Controller")
const { deleteProductImage, blockProduct } = require("../controller/product-Controller")
const { loadcouponList, loadAddCoupon, addCoupon } = require("../controller/coupon-Controller")
const adminRoute = express.Router()

adminRoute.use(express.static("public"))

adminRoute.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    next();
  });

adminRoute.get("/login" , isLogout,loadAdminLogin)
adminRoute.post("/login" , verifyLogin)
adminRoute.get("/adminDashboard" ,tokenVerify, loadAdminDashboard)
adminRoute.get("/usersList" ,tokenVerify, getAllUsers)
adminRoute.get("/blockUser" , blockUser)
adminRoute.get("/unBlockUser" , unblockUser)

adminRoute.get("/categoryList" ,tokenVerify, loadCategoryList)
adminRoute.get("/addCategory" ,tokenVerify, loadAddCategory)
adminRoute.post("/addCategory" , upload.single("image") , addNewCategory)
adminRoute.get("/editCategory" ,tokenVerify, loadEditCategory)
adminRoute.post("/editCategory" ,upload.single("image"), editCategory)
adminRoute.post("/blockCategory" , blockCategory)

adminRoute.get("/productList" ,tokenVerify, loadProductList)
adminRoute.get("/addProduct" ,tokenVerify, loadAddProduct)
adminRoute.post("/addProduct" ,upload.array("images"), addNewProduct)
adminRoute.get("/updateProduct" ,tokenVerify, loadUpdateProduct)
adminRoute.post("/updateProduct" , upload.array("images"), updateProduct)
adminRoute.post("/blockProduct" ,blockProduct)
adminRoute.post("/deleteProductImage" , deleteProductImage)

adminRoute.get("/orderList" , tokenVerify,adminOrderList)
adminRoute.get("/listAllOrders", tokenVerify,adminAllOrders)
adminRoute.post("/updateOrderStatus" , updateOrderStatus)

adminRoute.get("/couponList" , loadcouponList)
adminRoute.get("/addCoupon" ,loadAddCoupon)
adminRoute.post("/addCoupon" ,addCoupon)

adminRoute.get("/logout" , adminLogout)



module.exports = adminRoute