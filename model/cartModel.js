const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({

    userid:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    
    },
    products:[{

        productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"product",
        required:true
    },

        quantity:{
            type:Number
    }
            }],
    couponId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"coupon"
    },
    isCouponApplied:{
        type:Boolean,
        default:false
    }

})

module.exports = mongoose.model("Cart" , cartSchema)