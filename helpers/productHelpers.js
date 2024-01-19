const user = require("../model/userModel")
const product = require("../model/productModel")
const cart = require("../model/cartModel")
const order = require("../model/orderModel")
const { decode } = require("jsonwebtoken")
const mongoose = require("mongoose")
const{ObjectId} = mongoose.Types

module.exports={
    totalPrice:async(req,res)=> {
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
        console.log("fndprdcts");
        console.log(findProducts);
        // if(findProducts.length<=0){
        //       return false
        // }
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
        console.log(cartTotal[0].total); 
        return {cartTotal , findProducts , productTotal}
        
    },

    orderPipeline : async(req,orderId)=> {
        console.log(orderId);
        const userId = new ObjectId(decode(req.cookies.jwt).id)
        const newOrderId = new ObjectId(orderId)
        console.log(userId);
        const pipeLine =[
            {$match:{_id:newOrderId}},
            {$unwind:"$items"},
            {
                $project:{
                    Product:"$items.Product",
                    quantity:"$items.quantity",
                },
            },
            {
                $lookup:{
                    from:"products", 
                    localField:"Product",   
                    foreignField:"_id",
                    as:"orderItems",
                },
            },
        ]

        const findProducts =  await order.aggregate(pipeLine)
        console.log("ordfndprdcts");
        console.log(findProducts);
        
        const totalPipeline =[
            ...pipeLine,
            {
                $project:{
                    total:{
                        $multiply:["$quantity" ,{$arrayElemAt:["$orderItems.price" , 0]}]
                    },
                },
            },
        ]

        const productTotal = await order.aggregate(totalPipeline)
         
        const orderTotalPipeline =[
            ...pipeLine,
            {
                $group:{
                    _id:null,
                    total:{
                        $sum:{
                            $multiply:["$quantity" , {$arrayElemAt:["$orderItems.price", 0]}]
                        },
                    },
                },
            },
        ]
    
        const orderTotal = await order.aggregate(orderTotalPipeline)
    
        console.log(orderTotal[0].total); 
        return {orderTotal , findProducts , productTotal}
     
   
}

}

exports =
       cartCount = async(userId)=>{
        let count =0
        const findCart = await cart.findOne({userid:userId})
        console.log(findCart);
        if(findCart){
            count = findCart.products.length
           
        }
       
        return count
    }
