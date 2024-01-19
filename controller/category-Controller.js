const category = require("../model/categoryModel");
const product = require("../model/productModel");


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

module.exports ={
    loadEditCategory,
    editCategory,
    blockCategory
}