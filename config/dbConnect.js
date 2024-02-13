const mongoose = require("mongoose")
const dbConnect = async()=>{
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URL)
        console.log("db connected");
    } catch (error) {
        console.log(error.message);
        console.log("db error");
    }
}

module.exports = {   
    dbConnect  
}