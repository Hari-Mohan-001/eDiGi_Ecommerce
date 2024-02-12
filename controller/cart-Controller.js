const user = require("../model/userModel")
const product = require("../model/productModel")
const cart = require("../model/cartModel")
const { tokenVerify } = require("../middleware/authMiddleware")
const { decode } = require("jsonwebtoken")
const mongoose = require("mongoose")
const{ObjectId} = mongoose.Types
const productHelpers = require("../helpers/productHelpers")

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
        
        const{productid} = req.body
        const productIds = req.body.productId
        const productId = productIds||productid

        const findProduct = await product.findOne({_id:productId})
        const findCart = await cart.findOne({userid:userId}) 
        // let Quantity = 1

        if(findProduct.stock>0){
            if(!findCart){ 
               
                const newCart = new cart({   
                    userid:userId,
                    products:[ 
                        {
                         productId:productId,
                        quantity:1
                        }
                    ]
                })
 
               const savedCart=  await newCart.save()
               if(savedCart){
                console.log('json');
                 return res.json({'success':true , 'message':"Product added"})  
               }
                    
            }
            const existProduct = findCart.products.find(
                (findProduct)=>findProduct.productId.toString() === productId
            )
            

            if(existProduct && existProduct.quantity < findProduct.stock){
                console.log('update qty');
                await cart.updateOne(
                    { userid: userId, "products.productId": productId },    
                    { $inc: { "products.$.quantity": 1 } }
                );
                let stock = findProduct.stock
                const price = Math.round(findProduct.price)
                return res.json({'success':true , 'message':'quantity Updated' , 'stock':stock , 'price':price})
                
            }
            else if(findProduct.stock>1 && !existProduct){
                findCart.products.push({
                    productId:productId,
                    quantity:1
                })
                await findCart.save()
                res.redirect("/myCart")
            }

        }else{
            return res.json({'success':false, 'message':'Product Out Of stock'})
        }  
           

    } catch (error) {
        console.log(error.message);  
    }
}

const quantityUpdation = async(req,res)=>{
    try {
        const userId = decode(req.cookies.jwt).id
        
        // const productId = req.body.productId
        const{productId} = req.body

        const findProduct = await product.findOne({_id:productId})
        const findCart = await cart.findOne({userid:userId}) 
        // let Quantity = 1

        if(findProduct.stock>0){
            if(!findCart){ 
                
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
                
                const price = findProduct.price
              return res.json({'success':true, 'message':"reduced the quantity" , 'price':price})
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
        
        const {productid} = req.body
               
        const userId = decode(req.cookies.jwt).id
        const Cart = await cart.findOne({userid:userId})  
        console.log(Cart);
        if(Cart){
            const remove = await cart.updateOne({userid:userId},
                {
                    $pull:{products:{productId:productid}}
                }
                )
               res.json({'success':true , 'message':'item removed'})
        }else{
            res.json({'success':false})
        }

    } catch (error) {
        console.log(error.message); 
    }
}

const getCartTotal = async(req,res,next)=>{  
    try {
        let userId = decode(req.cookies.jwt).id
        const userCart = await cart.findOne({userid:userId})
        console.log(userCart);
        if(userCart.products.length>0){
            
        
        const {cartTotal , productTotal} =await productHelpers.totalPrice(req ,userId)
        const total = Math.round(cartTotal[0].total)
        console.log(cartTotal);
        if(cartTotal){
           
            return res.json({'success':true, 'message':`${total}` })              
        }else{
           
            return res.json({'success':false , 'message':'failed to get total'})       
        }        
    }else{
        
        return res.json({'success':false})
    }

    } catch (error) {
        next(error)
    }
}
module.exports ={
    laodCart, 
    addToCart,
    quantityUpdation,
    removeCartItem,
    getCartTotal
}