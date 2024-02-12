const mongoose = require("mongoose")
const bannerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:false
    },
    createdAt:{
          type:Date
    }
})

module.exports = mongoose.model('banner', bannerSchema)