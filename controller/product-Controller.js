const category = require("../model/categoryModel");
const product = require("../model/productModel");
const productHelpers = require("../helpers/productHelpers")
const{decode} = require("jsonwebtoken")

const loadCategories = async (req, res) => {
  try {
    let count = null
      
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
    console.log(count);

    const Category = await category.find({isBlocked:false}); 
    const Product = await product.find({isBlocked:false});
    res.render("userCategory", { categories: Category, products: Product , count }); 
  } catch (error) {
    console.log(error.message);
  }
};

const loadProducts = async (req, res) => {
  try {
    let count = null
      
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
    const id = req.query.id
    const Category = await category.findOne({_id:id ,isBlocked:false})
    console.log(Category);
    const Product = await product.find({categoryname:id, isBlocked:false})
    res.render("userProducts", { categories: Category, products: Product , count});
  } catch (error) {
    console.log(error.messsage);
  }
};


 const loadSingleProduct = async (req,res)=>{
    try {
      let count = null
      
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
        const id = req.query.id
        const Category = await category.find()
        const Product = await product.find({_id:id})
        console.log(Product);
        res.render("singleProduct",{products:Product , count})
    } catch (error) {
        console.log(error.message);
    }
}

const deleteProductImage = async(req,res)=>{
  try {
    const { ObjectId ,imageId} = req.body 
    
    
    console.log(ObjectId);
    console.log(imageId);
    const findProduct = await product.findByIdAndUpdate({_id:ObjectId}, 
      { 
          $pull:{
             image:imageId
          }
      }
      )
      if(findProduct){
        res.json('success')
      }
      
  } catch (error) {
    console.log(error.message);
  }
}

const blockProduct = async(req,res)=>{
  try {
    const{productId} = req.body
    console.log(productId);
    const findProduct = await product.findByIdAndUpdate({_id:productId})  
    if(findProduct.isBlocked){
      const unBlock = await product.findByIdAndUpdate({_id:productId} ,
        {
          $set:{
            isBlocked:false
          }
        }
        )
    }else{
      const blockProduct = await product.findByIdAndUpdate({_id:productId} ,
        {
          $set:{
            isBlocked:true
          }
        }
        )
    }

    res.json('success')
  } catch (error) { 
    console.log(error.message);
  }
}

const home = async (req, res) => {
  let count = null  
  if(req.cookies.jwt){
   count = await  cartCount(decode(req.cookies.jwt).id)
  }
  const Product = await product.find({isBlocked:false});
  res.render("home" ,{products:Product , count});
};

module.exports = {
  loadCategories,
  loadProducts,
  loadSingleProduct,
  deleteProductImage,
  blockProduct,
   home
};
