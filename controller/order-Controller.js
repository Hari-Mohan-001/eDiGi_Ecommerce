const user = require("../model/userModel")
const product = require("../model/productModel")
const cart = require('../model/cartModel')
const order = require("../model/orderModel")
const { decode } = require("jsonwebtoken")
const productHelpers = require("../helpers/productHelpers")
const moment = require("moment")
const mongoose = require("mongoose")
const{ObjectId} = mongoose.Types


const viewOrders = async(req,res)=>{
    try {
        let count = null
     if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
        const userId = decode(req.cookies.jwt).id
        let findOrder = await order.find({costumer:userId}).sort({_id:-1})
            findOrder = findOrder.map(orders =>({
                ...orders.toObject(),
                orderDate:moment(orders.orderedAt).format('DD/MM/YYYY')
            }))

            console.log(findOrder);
        res.render("viewOrders", {orders:findOrder, count})
    } catch (error) {
        console.log(error.message); 
    }
}

const orderDetails = async(req,res)=>{
    try {
        let count = null  
    if(req.cookies.jwt){
     count = await  cartCount(decode(req.cookies.jwt).id)
    }
        const orderId = req.query.id
        const {productTotal, findProducts}= await productHelpers.orderPipeline(req,orderId )
        console.log("drddetails");
        console.log(productTotal);
        
        
       let orderDetails = await order.find({_id:orderId})

       orderDetails = orderDetails.map(orders =>({
            ...orders.toObject(),
            orderDate:moment(orders.orderedAt).format('DD/MM/YYYY')
       }))
      
        
        res.render("orderDetails",{orders:orderDetails, moment , productTotal ,findProducts, count})
    } catch (error) {
        console.log(error.message); 
    }
}


const adminOrderList = async(req,res)=>{
    try {
       let orders = await order.find().sort({_id:-1}).populate('costumer')
            console.log(orders);
            orders = orders.map(orders =>({
                ...orders.toObject(),
                orderDate:moment(orders.orderedAt).format('DD/MM/YYYY') 
            }))

        res.render("listOrders" , {orders , moment})
    } catch (error) {
        console.log(error.message);
    }
}

const adminAllOrders = async(req,res)=>{
    try {
        const orderId = req.query.id
        console.log("one"+orderId);
        const {productTotal, findProducts}= await productHelpers.orderPipeline(req,orderId )
        console.log(productTotal);
        console.log(orderId);
        let orders = await order.find({_id:orderId}) 
            console.log(orders);
            orders = orders.map(orders =>({
                ...orders.toObject(),
                orderDate:moment(orders.orderedAt).format('DD/MM/YYYY') 
            }))
            console.log(orders);

        res.render("listAllOrders" , {orders ,moment, productTotal ,findProducts})

    } catch (error) {
        console.log(error.message);
    }
}

const updateOrderStatus = async(req,res)=>{
    try {
        const{orderId , orderStatus} = req.body
        const neworderId = new ObjectId(orderId)
        console.log(orderStatus);
        const updateOrder = await order.findByIdAndUpdate({_id:neworderId} , 
            {
                $set:{
                    orderStatus:orderStatus 
                },
            }
            )
            res.json('success')
            
    } catch (error) {
        console.log(error.message);
    }
}

const cancelOrder = async(req,res)=>{ 
    try {
        console.log('cancelrote');
        const userId = decode(req.cookies.jwt).id
        const{orderId , orderValue} = req.body
        console.log(orderId);
        const cancelledOrder = await order.findOneAndUpdate({_id:orderId},
            {
               $set:{
                orderStatus:"Cancelled" 
               } 
            },
            {new:true} 
            )

            if(cancelledOrder){
                res.json(cancelledOrder)  
                const orderItems = cancelledOrder.items
                console.log(orderItems);
                orderItems.forEach(async(item)=>{
                    const{Product:Product , quantity} = item
                    console.log('cancel');
                    await product.updateOne({_id:Product},
                        {
                            $inc:{
                                stock:quantity
                            }
                        },
                        {new:true}
                        )
                })

                if(cancelledOrder.payment != 'Cash on delivery'){
                    console.log('wkltrefil');
                    await user.updateOne({_id:userId},
                        {
                            $inc:{
                                wallet:orderValue
                            }
                        },
                        {new:true}, 
                        )

                        const history = {amount:orderValue,
                            description: 'Amount from order cancel',
                            status:'Credit',
                            date: new Date()          
           }

                        const walletHistory = await user.findByIdAndUpdate({_id:userId},
                            {
                                $addToSet:{
                                    walletHistory:history
                                }
                            }
                            )
                }
            }else{
                res.json("Cancelled Failed")
            }


        
    } catch (error) {
        console.log(error.message);
    }
}

const deleteInOrder = async(req,res)=>{
    try {
        const{proId , orderId} = req.body
       console.log(orderId);
       console.log(proId);
       const deleteInOrder = await order.findByIdAndUpdate({_id:orderId}, 
        {
            $pull:{
                items:{
                    Product:new ObjectId(proId)
                }
            }
        },
        {new:true}
        )
        const updatingOrder = await order.findById({_id:orderId})

        const newtotal = updatingOrder.items.reduce((total , item) => total + item.quantity*item.cartItems[0].price, 0)
        const updatedOrder = await order.findByIdAndUpdate({_id:orderId} , 
            {
                $set:{
                    totalPrice:newtotal
                }
            },
            {new:true}
            )
        res.json('success')

    } catch (error) {
        console.log(error.message);
    }
}

const cancelEachProductInOrder = async(req,res)=>{
    try {
        const{proId , orderId} = req.body
        console.log(proId ,orderId);
        
        const userId = decode(req.cookies.jwt).id 

        const cancelOrder = await order.findOneAndUpdate(
            { _id: new ObjectId(orderId), 'items.Product': new ObjectId(proId) },
            {
              $set: {
                'items.$.Cancelled': true,
              },
            },
            { new: true }
          );

          if(cancelOrder){
        
          
          const cancelOrderAggregate = await order.aggregate([
            {
              $match: { _id: new ObjectId(orderId) },
            },
            {
              $unwind: '$items',
            },
            {
              $match: { 'items.Cancelled': { $ne: true } },
            },
            {
              $unwind: '$items.cartItems',
            },
            {
              $group: {
                _id: '$_id',
                items: { $push: '$items' },
                totalPrice: { $sum: { $multiply: ['$items.quantity', '$items.cartItems.price'] } },
              },
            },
          ]).exec();

        console.log('total'+cancelOrderAggregate[0].totalPrice);   
        console.log(cancelOrderAggregate[0]);

        let newTotal = cancelOrderAggregate[0].totalPrice
        let parsedNewTotal = parseInt(newTotal)
        const amountToReturned = cancelOrder.totalPrice - newTotal
        console.log('new'+newTotal , 'retun'+amountToReturned);
       const updateOrder = await order.findByIdAndUpdate({_id:orderId},
        {
            $set:{
                totalPrice:newTotal
            }
        },
        {new:true}
        )
               
        res.json({total:parsedNewTotal})
           
        const cancelledItem = cancelOrder.items.find((item)=> item.Product.toString()===proId)
        const updateProductQuantity = await product.findByIdAndUpdate({_id:proId},
            {
                $inc:{
                    stock:cancelledItem.quantity
                }
            }
            )
              
            const history = {amount:amountToReturned,
                             description: 'Amount from order cancel',
                             status:'Credit',
                             date: new Date()          
            }
            console.log('before waltupdate');
            const updateWallet = await user.findByIdAndUpdate({_id:userId},
                {
                    $inc:{
                         wallet:amountToReturned
                    },     
                }
                )

                const walletHistory = await user.findByIdAndUpdate({_id:userId},
                    {
                        $addToSet:{
                            walletHistory:history
                        }
                    }
                    )
            }else{
                res.json("failed")
            }    

    } catch (error) {
        console.log(error.message); 
    }
}

const returnOrder = async(req,res)=>{
    try {
        console.log('return');
        const userId = decode(req.cookies.jwt).id 
        const{orderId , orderValue} = req.body
        console.log(orderValue);
        const orderReturn = await order.findByIdAndUpdate({_id:orderId},
            {
                $set:{
                    orderStatus:"Returned"
                }
            },
            {new:true},
            )
            if(orderReturn){
                console.log(orderReturn);
                res.json(orderReturn)
                console.log('retorer json'); 
                const orderItems = orderReturn.items
                console.log(orderItems);
                orderItems.forEach(async(item) => {
                    const{ Product:Product, quantity} = item
                    console.log(product);
                    await product.updateOne({_id:Product},
                        {
                            $inc:{
                                stock:quantity  
                            }
                        }
                        )
                })
                
                await user.updateOne({_id:userId},
                    {
                        $inc:{
                            wallet:orderValue
                        },

                    }
                    )

                    const history = {amount:orderValue,
                        description: 'Amount from order return',
                        status:'Credit',
                        date: new Date()          
       }

       const walletHistory = await user.findByIdAndUpdate({_id:userId},
        {
            $addToSet:{
                walletHistory:history
            }
        }
        )
            }else{
                res.json("Not returned")
            }
    } catch (error) {
        console.log(error.message);
    }
}


 
module.exports ={
    viewOrders,
    orderDetails,
    cancelOrder,
    returnOrder,
    adminOrderList,
    updateOrderStatus, 
    deleteInOrder,
    adminAllOrders,
    cancelEachProductInOrder
}