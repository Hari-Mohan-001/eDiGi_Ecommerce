const category = require("../model/categoryModel");
const product = require("../model/productModel");
const{decode}= require("jsonwebtoken")


const loadEditCategory = async(req,res)=>{
    try {
        let count = null  
        if(req.cookies.jwt){
         count = await  cartCount(decode(req.cookies.jwt).id)
        }
        const categoryId = req.query.id
        const findCategory = await category.findOne({_id:categoryId})

        res.render("editCategory", {category:findCategory,count})
    } catch (error) {
        console.log(error.message);
    }
}

const editCategory = async(req,res)=>{
    try { 
        const categoryName = req.body.categoryName
        const categoryId = req.body.categoryId
        const Category = await category.findById({_id:categoryId}) 
        if(Category.name === categoryName){
            let categoryData = {}
            if(req.file){
                categoryData.image = req.file.filename
            }
            const updatedCategory = await category.findByIdAndUpdate({_id:categoryId},
                {
                    $set:categoryData 
                }
                )
                res.redirect("/admin/categoryList")
        }else{
            const findCategory = await category.find({name:{$regex: new RegExp("^"+categoryName+"$","i")}})
            if(findCategory.length>0){
                res.render("editCategory" , {message:`This category - ${categoryName} exist`})
        }else{
            let categoryData = {
                name:req.body.categoryName
            }
            if(req.file){
                categoryData.image = req.file.filename
            }
            const updatedCategory = await category.findByIdAndUpdate({_id:categoryId},
                {
                    $set:categoryData
                }
                )
                res.redirect("/admin/categoryList")
        }
      }
    } catch (error) {
        console.log(error.message);
    }
}

const blockCategory = async(req,res)=>{
    try {
        const {id }= req.body
        const categoryData = await category.findById({_id:id})
        if(categoryData.isBlocked){
            const unBlock = await category.findByIdAndUpdate({_id:id},
                {
                    $set:{
                        isBlocked:false 
                    }
                }
                )
               if(unBlock){
                res.json('success')
               }
        }else{
            const block = await category.findByIdAndUpdate({_id:id}, 
              {
                $set:{
                    isBlocked:true
                }
              }  
                )
                if(block){
                    res.json('success')
                }
        }
              

    } catch (error) {
        console.log(error);
    }
}

const activateCategoryOffer = async(req,res)=>{
    try {
        const{categoryId, discount} =req.body
        const parsedDiscount = parseInt(discount)

        const categories = await category.findById({_id:categoryId, isBlocked:false})
        const updatedCategory = await category.findByIdAndUpdate({_id:categoryId},
            {
                $set:{
                    isOfferApplied:true
                },
                
            }
            )

        const products = await product.updateMany({categoryname:categoryId , isBlocked:false ,isOfferApplied:false},
            [
                {
                    $set: {
                        discountedPrice: {
                            $multiply: [
                                { $toDouble: '$price' },
                                { $subtract: [1, { $divide: [parsedDiscount, 100] }] },
                            ],
                        },
                    },
                },
                {
                    $set: {
                        oldPrice:'$price',
                        price:{
                            $round: ['$discountedPrice']
                        },
                       
                        isOfferApplied: true,
                        offerType: 'Category Offer',

                    },
                },
            ]
            
            )
           
            
            if(products){
                res.json("success")
            }else{
                res.json("failed")
            }

    } catch (error) {
        console.log(error.message);
    }
}

const removeCategoryOffer = async(req,res)=>{
    try {
        const{categoryId} = req.body

        const categories = await category.findById({_id:categoryId, isBlocked:false , isOfferApplied:true})
        const updatedCategory = await category.findByIdAndUpdate({_id:categoryId},
            {
                $set:{
                    isOfferApplied:false,
                    
                },
                
            }
            )

            const products = await product.updateMany({categoryname:categoryId , isBlocked:false ,isOfferApplied:true},
                [
                    {
                        $addFields: {
                            convertedPrice: {
                                $multiply: [
                                    { $toDouble: '$oldPrice' },
                                    1, // Ensure 1 is multiplied to avoid the Cast to Number failed error
                                ],
                            },
                        },
                    },
                    {
                        $set: {
                            isOfferApplied: false,
                            offerType: null,
                            oldPrice: null,
                            price: '$convertedPrice',
                            convertedPrice: null,
                        },
                    },
                ]
            );

                if(products){
                    res.json("success")
                }else{
                    res.json("failed")
                }



    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    loadEditCategory,
    editCategory,
    blockCategory,
    activateCategoryOffer,
    removeCategoryOffer
}