const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const userShema = new mongoose.Schema({
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            lowercase:true,
            unique:true
        },
        mobile:{
            type: String,
            required:true,
            unique:true
        },
        
        password:{
            type:String,
            required:true
        },
        address:[{
            fullName:{
                type:String,
                required:true
            },
            country:{
                type:String,
                required:true
            },
            number:{
                type:Number,
                required:true
            },
            house:{
                type:String,
                required:true
            },
            city:{
                type:String,
                required:true
            },
            state:{
                type:String,
                required:true
            },
            pincode:{
                type:Number,
                required:true
            }

        }],
        wishlist:[{
             type:mongoose.Schema.Types.ObjectId,
             ref:"product"
        }],
        blocked:{
            type:Boolean,
            default:false
        }, 
        token:{
            type:String,
            default:""
        },  
        wallet:{
           type:Number,    
           default:0,
           
        },
        walletHistory:[{}],
        profileImage:{
            type:String
        }
},
{
    timestamps:true,
})

userShema.pre("save" , async function(next){
    const salt = bcrypt.genSaltSync(10)
    hashedPassword = await bcrypt.hash(this.password , salt) 
    this.password = hashedPassword
    return next()
})

// userShema.methods.hashPassword = async function(enteredPassword){
//     const salt = bcrypt.genSaltSync(10)
//     const hashedPassword = await bcrypt.hash(enteredPassword, salt)
//     return hashedPassword
// }

userShema.methods.isPasswordMatched = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword ,this.password )
}
module.exports= mongoose.model("user",userShema) 