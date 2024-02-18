const category = require("../model/categoryModel")
const product = require("../model/productModel")
const user = require("../model/userModel")
const{decode}= require("jsonwebtoken")
const cart = require("../model/cartModel")

const loadWishlist = async(req,res)=>{
    try {
        let count = null
     if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
        const UserId= decode(req.cookies.jwt).id
        const User = await user.findOne({_id:UserId})
        
        const wishlistProducts = await product.find({_id:User.wishlist})
        console.log('wishlist');
        console.log(wishlistProducts);

        res.render("wishlist", {products:wishlistProducts , count})
    } catch (error) {
        console.log(error.message);
    }
}

const addToWishlist = async(req,res)=>{
    try {
        const{productId} = req.body
        const userId = decode(req.cookies.jwt).id
        const updateUser = await user.findOneAndUpdate({_id:userId},
            {
                $addToSet:{
                    wishlist:productId
                }
            },
            {new:true}
            )
            if(updateUser){ 
                console.log('wishlst'); 
               return res.json({'success':true})
            }else{
                res.status(500)
            }
    } catch (error) {
        console.log(error.message);
    }
}

const removeFromWishlist = async(req,res)=>{
        try {
            const{productId} = req.body
            const UserId= decode(req.cookies.jwt).id
            const User = await user.findOne({_id:UserId})
            const removeProduct = await user.findByIdAndUpdate({_id:UserId},
                {
                    $pull:{
                        wishlist:productId
                    }
                },
                {new:true},
                )

                if(removeProduct){
                    res.json("success")
                }
        } catch (error) {
            console.log(error.message);
        }
}

module.exports = {
loadWishlist,
addToWishlist,
removeFromWishlist
}