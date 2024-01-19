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

const cancelOrder = async(req,res)=>{
    try {
        const orderId = req.query.id
        console.log(orderId);
        const findOrder = await order.findOneAndUpdate({_id:orderId},
            {
               $set:{
                orderStatus:"Cancelled"
               } 
            },
            {new:true} 
            )
            console.log(findOrder);

        res.redirect("/orders")
    } catch (error) {
        console.log(error.message);
    }
}

const adminOrderList = async(req,res)=>{
    try {
       let orders = await order.find().populate('costumer')
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
        const {productTotal, findProducts}= await productHelpers.orderPipeline(req,orderId )
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
 
module.exports ={
    viewOrders,
    orderDetails,
    cancelOrder,
    adminOrderList,
    updateOrderStatus, 
    deleteInOrder,
    adminAllOrders
}