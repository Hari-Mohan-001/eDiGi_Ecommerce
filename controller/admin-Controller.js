const admin = require("../model/userModel");
const category = require("../model/categoryModel");
const product = require("../model/productModel");
const adminJwt = require("jsonwebtoken");

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

const maxAge = 3 * 24 * 60 * 60;
const createToken = (email) => {
  return adminJwt.sign({ email }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: maxAge,
  });
};

const loadAdminLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findAdmin = await admin.findOne({ email });
    console.log(findAdmin);
    const adminData = {
      email: adminEmail,
      password: adminPassword,
    };
    if (email === adminData.email && password === adminData.password) {
      const token = createToken(email);
      res.cookie("adminjwt", token, { httpOnly: true, maxAge: maxAge * 1000 });

      res.redirect("/admin/adminDashboard");
    } else {
      res.render("adminLogin", { message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadAdminDashboard = async (req, res) => {
  try {
    res.render("adminDashboard");
  } catch (error) {
    console.log(error.message);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await admin.find();
    res.render("usersList", { users: users });
  } catch (error) {
    console.log(error.message);
  }
};

const blockUser = async (req, res) => {
  try {
    console.log("block");
    const id = req.query.id;
    const blockuser = await admin.findByIdAndUpdate(
      { _id: id },
      { $set: { blocked: true } }
    );
    res.redirect("/admin/usersList");
  } catch (error) {
    console.log(error.message);
  }
};

const unblockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const unblockuser = await admin.findByIdAndUpdate(
      { _id: id },
      { $set: { blocked: false } }
    );
    res.redirect("/admin/usersList");
  } catch (error) {
    console.log(error.message);
  }
};

// const getSingleUser = async(req,res)=>{
//     try {
//         const id = req.query.id
//         const user1 = await admin.findOne({_id:id})
//         res.json(user1)
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const loadCategoryList = async (req, res) => {
  try {
    const categoryList = await category.find();
    console.log(categoryList);
    res.render("categoryList", { categories: categoryList });
  } catch (error) {
    console.log(error.message);
  }
};

const loadAddCategory = async (req, res) => {
  try {
    res.render("addCategory");
  } catch (error) {
    console.log(error.message);
  }
};

const addNewCategory = async (req, res) => {
  try {
    const categoryName = req.body.categoryName;
    const findCategory = await category.find({name:{$regex: new RegExp("^"+categoryName+"$","i")} });
    // const findCategory = await category.find({name:categoryName})
    console.log(findCategory);
    console.log("found");
    if (findCategory.length > 0) {
      res.render("addCategory", { message: `This Category - ${categoryName} already exist, No dupilcate category allowed` });
    } else {
      console.log("not found");
      const Category = new category({
        name: categoryName,
        image: req.file.filename,
      });
      const newCategory = await Category.save();
      console.log("added");
      if (newCategory) {
        res.redirect("/admin/categoryList");
      } else {
        res.render("addCategory", {
          message: "Category adding failed, please try again",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadProductList = async (req, res) => { 
  try {
    
    const categories = await category.find()
    const Product = await product.find().populate("categoryname")
    // const Category = await category.find();
    console.log("product list");  
    res.render("productList", { products: Product }); 
  } catch (error) {
    console.log(error.message);
  }
};

const loadAddProduct = async (req, res) => {
  try {
    const Category = await category.find({isBlocked:false});
    res.render("addProduct", { categories: Category });
  } catch (error) {
    console.log(error.message);
  }
};

const addNewProduct = async (req, res) => {
  try {
    const Category = await category.find({isBlocked:false});
   
    const newprice = parseFloat(req.body.price)
    const newStock = parseFloat(req.body.stock)

     if(newprice<=0 || newStock<=0){
      res.render("addProduct", {categories: Category, message:"Price & stock should be greater than zero"}); 
     }else{

      const images = req.files.map((file)=>{
        return file.filename
      })

    console.log("product route");
    const Product = new product({
      productName: req.body.productName,
      categoryname: req.body.categoryName,
      description: req.body.description,
      brand: req.body.brand,
      image:images,
      price: newprice,
      stock:req.body.stock
    });
    const newProduct = await Product.save(); 
    console.log(newProduct);
    res.redirect("/admin/addProduct");
  }
  } catch (error) {
    console.log(error.message);
  }
};

const loadUpdateProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await product.findById({ _id: id });
    if (productData) {
      console.log("product data");
      res.render("updateProducts", { products: productData });
    } else {
      res.redirect("/admin/admindashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
     const images = req.files.map((file)=>{
      return file.filename
     })

     const dataUpdate = {
      $set: {
        productName: req.body.productName,
        description: req.body.description,
        brand: req.body.brand,
        price: req.body.price,
        stock:req.body.stock
      },

     }

     if(images.length>0){
      dataUpdate.$push = {image:{$each:images}}
     }

    const productDataUpdate = await product.findByIdAndUpdate(
      { _id: req.body.id },dataUpdate  
    );
    res.redirect("/admin/productList");
  } catch (error) {
    console.log(error.message);
  }
};

const adminLogout = async (re, res) => {
  try {
    res.cookie("adminjwt", "", { maxAge: 1 });
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error.message);
  }
};



module.exports = { 
  loadAdminLogin,
  verifyLogin,
  loadAdminDashboard,
  getAllUsers,
  blockUser,
  loadCategoryList,
  loadAddCategory,
  addNewCategory,
  loadProductList,
  loadAddProduct,
  unblockUser,
  addNewProduct,
  loadUpdateProduct,
  updateProduct,
  adminLogout,

};
