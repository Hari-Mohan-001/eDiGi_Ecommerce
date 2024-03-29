const express = require("express")
const { getAllUsers, getSingleUser, loadAdminLogin, verifyLogin, loadAdminDashboard, loadCategoryList, loadAddCategory,
   addNewCategory, blockUser, loadProductList, loadAddProduct, unblockUser, addNewProduct, loadUpdateProduct, 
   updateProduct, logout, adminLogout, loadSalesReport, chartData, } = require("../controller/admin-Controller")
const {tokenVerify,isLogout} =require("../middleware/adminAuth") 
const upload = require("../middleware/multer")
const { adminOrderList, updateOrderStatus, adminAllOrders } = require("../controller/order-Controller")
const { loadEditCategory, editCategory, blockCategory, activateCategoryOffer, removeCategoryOffer } = require("../controller/category-Controller")
const { deleteProductImage, blockProduct, productOffers, createProductOffer, deactivateProductOffer } = require("../controller/product-Controller")
const { loadcouponList, loadAddCoupon, addCoupon, deleteCoupon } = require("../controller/coupon-Controller")
const { laodBanners, loadAddBanner, addBanner, bannerManagement } = require("../controller/bannerController")
const { uploadBanner } = require("../middleware/multerForBanner")
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
adminRoute.get("/dashboard" ,tokenVerify, loadAdminDashboard)
adminRoute.get("/usersList" ,tokenVerify, getAllUsers)
adminRoute.get("/blockUser" ,tokenVerify, blockUser)
adminRoute.get("/unBlockUser" ,tokenVerify, unblockUser)

adminRoute.get("/categoryList" ,tokenVerify, loadCategoryList)
adminRoute.get("/addCategory" ,tokenVerify, loadAddCategory)
adminRoute.post("/addCategory" ,tokenVerify, upload.single("image") , addNewCategory)
adminRoute.get("/editCategory" ,tokenVerify, loadEditCategory)
adminRoute.post("/editCategory" ,tokenVerify, upload.single("image"), editCategory)
adminRoute.post("/blockCategory" ,tokenVerify, blockCategory)
adminRoute.post("/createCategoryOffer" , tokenVerify, activateCategoryOffer)
adminRoute.post("/deactivateCategoryOffer" , tokenVerify , removeCategoryOffer)

adminRoute.get("/productList" ,tokenVerify, loadProductList)
adminRoute.get("/addProduct" ,tokenVerify, loadAddProduct) 
adminRoute.post("/addProduct" ,upload.array("images"), addNewProduct)
adminRoute.get("/updateProduct" ,tokenVerify, loadUpdateProduct)
adminRoute.post("/updateProduct" , upload.array("images"), updateProduct)
adminRoute.post("/blockProduct" ,tokenVerify, blockProduct)
adminRoute.post("/deleteProductImage" ,tokenVerify, deleteProductImage)
adminRoute.get("/productOffers" , tokenVerify, productOffers)
adminRoute.post("/createProductOffer", tokenVerify, createProductOffer)
adminRoute.post("/deactivateProductOffer" , tokenVerify, deactivateProductOffer)

adminRoute.get("/orderList" , tokenVerify,adminOrderList)
adminRoute.get("/listAllOrders", tokenVerify,adminAllOrders)
adminRoute.post("/updateOrderStatus" ,tokenVerify, updateOrderStatus)

adminRoute.get("/couponList" ,tokenVerify, loadcouponList)
adminRoute.get("/addCoupon" ,tokenVerify,loadAddCoupon)
adminRoute.post("/addCoupon" ,tokenVerify, addCoupon)
adminRoute.post("/deleteCoupon" ,tokenVerify, deleteCoupon)

adminRoute.get("/salesReport", tokenVerify,loadSalesReport)
adminRoute.get("/charts" , tokenVerify ,chartData)

adminRoute.get("/banner", tokenVerify , laodBanners)
adminRoute.get("/addBanner" , tokenVerify , loadAddBanner)
adminRoute.post("/addBanner" , tokenVerify, uploadBanner.single("bannerImage"),addBanner)
adminRoute.post("/bannerManagement" , tokenVerify , bannerManagement)

adminRoute.get("/logout" , adminLogout)



module.exports = adminRoute