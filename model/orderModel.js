const mongoose = require("mongoose")

const orderSchema = mongoose.Schema({
    costumer:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    address:{
        type:String,
        required:true
    },
    items:{
        type:Array,
        required:true
    },
    totalPrice:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        default:0
    },
    balanceAmount:{
        type:Number
    },
    isWalletApplied:{
        type:Boolean,
        default:false
    },
    orderStatus:{
         type:String,
         enum:['Pending' ,'Shipped' , 'Cancelled' , 'Processing' , 'Delivered' , 'Returned' ],
         default:'Pending'
    },
    payment:{
        type: String,
        required:true
    },
    orderedAt: {
        type: Date,
        required:true
    },
    isCouponApplied:{
        type:Boolean,
        default:false
    },
    couponId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"coupon"
    }
})

module.exports = mongoose.model("Order", orderSchema)