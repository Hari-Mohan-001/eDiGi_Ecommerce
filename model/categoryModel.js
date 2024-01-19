const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({

    name:{
        type:String,
        reqired:true
    },
    image:{
        type:String,
        required: true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    
})

 module.exports = mongoose.model("Category" , categorySchema)