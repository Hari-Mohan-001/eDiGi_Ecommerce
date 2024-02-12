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

const loadProducts = async (req, res , next) => {
  try {
    let count = null
      
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
    const id = req.query.id
    const Category = await category.findOne({_id:id ,isBlocked:false})
    console.log('in prodruote');
    const Product = await product.find({categoryname:id, isBlocked:false})
    res.render("userProducts", { categories: Category, products: Product , count});
  } catch (error) {
    next(error)
    
  }
};


 const loadSingleProduct = async (req,res, next)=>{
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
      next(error)
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



const productOffers = async(req,res)=>{
  try {
    const products = await product.find({isBlocked:false}).populate("categoryname");
    res.render("productOffer" ,{products})
  } catch (error) {
    console.log(error.message);
  }
}

const createProductOffer = async(req,res)=>{
  try {
    const{productId , discount}= req.body
     console.log(productId , discount);
    const Product = await product.findById({_id:productId})
    console.log('ofrprdct'+Product);
    let oldPrice = Product.price
     let discountedPrice = Math.round(Product.price*discount/100) 
     let newPrice = Product.price-discountedPrice
   const offerProduct =  await product.findByIdAndUpdate({_id:productId},
      {
        $set:{
          price:newPrice,
          oldPrice:oldPrice,
          isOfferApplied:true,
          offerType:'Product Offer'
        }
      },
      {new:true},
      )
      if(offerProduct){
        console.log('success');
        res.json("success")
      }

  } catch (error) {
    console.log(error.message);
  }
}

const deactivateProductOffer = async(req,res)=>{
  try {
    const{productId}= req.body
    const Product = await product.findById({_id:productId})
    let oldPrice = Product.oldPrice
    const deactivateOffer = await product.findByIdAndUpdate({_id:productId},
      {
        $set:{
          price:oldPrice,
          isOfferApplied:false,
          oldPrice:null,
          offerType:null,
        }
      },
      {new:true},
      )

      if(deactivateOffer){
        res.json("success")
      }
  } catch (error) {
    console.log(error.message);
  }
}

const getAllProducts = async(req,res)=>{
  try {
    let count = null  
  if(req.cookies.jwt){
   count = await  cartCount(decode(req.cookies.jwt).id)
  }
  const categories = await category.find({isBlocked:false})
  const products = await product.find({isBlocked:false})

  let search =''
  if(req.query.search){
    search = req.query.search.trim()
  }

  const categoryId = req.query.category
  const brand = req.query.brand
  
  const sortBy = req.query.sortBy
  let sortQuery ={}

  if(sortBy){
    if(sortBy==='lowPrice'){
      sortQuery = {price:1}
    }else if(sortBy ==='highPrice'){
      sortQuery ={price:-1}
    }
  }

  let filterQuery ={}

  if(search){
    filterQuery.productName = {$regex:search ,$options:"i"}
  }

  if(categoryId){
    filterQuery.categoryname = categoryId
    console.log('fillenter');
  }else{
    filterQuery.categoryname = {
      $nin: await product.find({isBlocked:true})
    }
  }

  if(brand){
    filterQuery.brand = {$regex:brand , $options:"i"}
  }

const productBrand = await product.find().distinct('brand')
console.log(productBrand);
  
  const filteredProducts = await product.find(filterQuery).sort(sortQuery).exec() 
 
 
  const productCount = await product.find(filterQuery).countDocuments()

    res.render("allProducts" ,{count , categories, products:filteredProducts, sortBy, categoryId , productBrand})
  } catch (error) {
    console.log(error.message); 
  }
}

module.exports = {
  loadCategories,
  loadProducts,
  loadSingleProduct,
  deleteProductImage,
  blockProduct,
  productOffers,
  createProductOffer,
  deactivateProductOffer,
  getAllProducts,
   
};
