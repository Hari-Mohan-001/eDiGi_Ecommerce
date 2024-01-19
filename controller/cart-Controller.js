const user = require("../model/userModel")
const product = require("../model/productModel")
const cart = require("../model/cartModel")
const { tokenVerify } = require("../middleware/authMiddleware")
const { decode } = require("jsonwebtoken")
const mongoose = require("mongoose")
const{ObjectId} = mongoose.Types

const laodCart = async(req,res)=>{
    try {
        let count = null  
        if(req.cookies.jwt){
         count = await  cartCount(decode(req.cookies.jwt).id)
        }
        const userId = new ObjectId(decode(req.cookies.jwt).id)
        console.log(userId);
        const pipeLine =[
            {$match:{userid:userId}},
            {$unwind:"$products"},
            {
                $project:{
                    Product:"$products.productId",
                    quantity:"$products.quantity",
                },
            },
            {
                $lookup:{
                    from:"products", 
                    localField:"Product",   
                    foreignField:"_id",
                    as:"cartItems",
                },
            },
        ]

        const findProducts =  await cart.aggregate(pipeLine)
        console.log(findProducts);
        const totalPipeline =[
            ...pipeLine,
            {
                $project:{
                    total:{
                        $multiply:["$quantity" ,{$arrayElemAt:["$cartItems.price" , 0]}]
                    },
                },
            },
        ]

        const productTotal = await cart.aggregate(totalPipeline)

        const cartTotalPipeline =[
            ...pipeLine,
            {
                $group:{
                    _id:null,
                    total:{
                        $sum:{
                            $multiply:["$quantity" , {$arrayElemAt:["$cartItems.price", 0]}]
                        },
                    },
                },
            },
        ]

        const cartTotal = await cart.aggregate(cartTotalPipeline)
        
        console.log(cartTotal);
       
        res.render("userCart", {products:findProducts , productTotal , cartTotal ,count})
    } catch (error) {
        console.log(error.message);
    }
}



const addToCart = async(req,res)=>{
    try {
        const userId = decode(req.cookies.jwt).id
        console.log(" add cart route");
        const{productid} = req.body
        const productIds = req.body.productId
        const productId = productIds||productid

        const findProduct = await product.findOne({_id:productId})
        const findCart = await cart.findOne({userid:userId}) 
        // let Quantity = 1

        if(findProduct.stock>0){
            if(!findCart){ 
                console.log("stock");
                const newCart = new cart({  
                    userid:userId,
                    products:[ 
                        {
                         productId:productId,
                        quantity:1
                        }
                    ]
                })
 
                await newCart.save()
                res.redirect("/myCart")         
            }
            const existProduct = findCart.products.find(
                (findProduct)=>findProduct.productId.toString() === productId
            )
            

            if(existProduct && existProduct.quantity < findProduct.stock){
                console.log(existProduct);
                await cart.updateOne(
                    { userid: userId, "products.productId": productId },
                    { $inc: { "products.$.quantity": 1 } }
                );
                
                res.redirect("/myCart")
                // res.status(200).send("Product already exist in cart")
            }
            else if(findProduct.stock>1 && !existProduct){
                findCart.products.push({
                    productId:productId,
                    quantity:1
                })
                await findCart.save()
                res.redirect("/myCart")
            }

        }  
           

    } catch (error) {
        console.log(error.message);  
    }
}

const quantityUpdation = async(req,res)=>{
    try {
        const userId = decode(req.cookies.jwt).id
        console.log("cart route");
        const productId = req.body.productId

        const findProduct = await product.findOne({_id:productId})
        const findCart = await cart.findOne({userid:userId}) 
        // let Quantity = 1

        if(findProduct.stock>0){
            if(!findCart){ 
                console.log("stock");
                const newCart = new cart({  
                    userid:userId,
                    products:[ 
                        {
                         productId:productId,
                        quantity:1
                        }
                    ]
                })
 
                await newCart.save()
                res.redirect("/myCart")         
            }
            const existProduct = findCart.products.find(
                (findProduct)=>findProduct.productId.toString() === productId
            )
            

            if(existProduct && existProduct.quantity <= findProduct.stock){
                console.log(existProduct);
                await cart.updateOne(
                    { userid: userId, "products.productId": productId },
                    { $inc: { "products.$.quantity": -1 } }
                );
                
                res.redirect("/myCart")
                // res.status(200).send("Product already exist in cart")
            }
            else if(findProduct.stock>1 && !existProduct){
                findCart.products.push({
                    productId:productId,
                    quantity:1
                })
                await findCart.save()
                res.redirect("/myCart")
            }

        }      

    } catch (error) {
        console.log(error.message);  
    }
}

const removeCartItem = async(req,res)=>{
    try {
        const productid = req.query.id
        const userId = decode(req.cookies.jwt).id
        const Cart = await cart.findOne({userid:userId})
        console.log(Cart);
        if(Cart){
            const remove = await cart.updateOne({userid:userId},
                {
                    $pull:{products:{productId:productid}}
                }
                )
                res.redirect("/myCart")
        }else{
            res.send("not removed")
        }

    } catch (error) {
        console.log(error.message); 
    }
}
module.exports ={
    laodCart, 
    addToCart,
    quantityUpdation,
    removeCartItem
}