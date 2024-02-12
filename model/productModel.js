const mongoose = require("mongoose")
// const { array } = require("../middleware/multer")

const productSchema = mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    categoryname:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
        
    },
    description:{
        type:String,
        required :true
    },
    brand:{
        type:String,
        required:true
    },
    image:{
        type: Array,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    stock:{
        type:Number,
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    isOfferApplied:{
        type:Boolean,
        default:false
    },
    oldPrice:{
        type:Number,
        default:0
    },
    offerType:{
         type:String
    }
    
},{
    timestamps:true,
})

module.exports = mongoose.model("product", productSchema)