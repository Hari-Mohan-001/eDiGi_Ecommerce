const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema({
     name:{
        type:String,
        required:true
     },
     percentage:{
        type:Number,
        required:true
     },
     minimum:{
        type:Number,
        required:true
     },
     
     expiryDate:{
        type:Date,
        required:true
     },
     isActive:{
        type:Boolean,
        default:true
     },
     userId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
     }]
})

module.exports= mongoose.model("coupon" , couponSchema)