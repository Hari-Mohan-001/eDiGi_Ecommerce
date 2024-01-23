const coupon = require("../model/couponModel")
const user = require("../model/userModel")
const cart = require("../model/cartModel")
const { decode } = require("jsonwebtoken")
const moment =require("moment")

const loadcouponList = async(req,res)=>{
    try {
        let coupons = await coupon.find()
        coupons = coupons.map(coupons =>({
            ...coupons.toObject(),
            expDate :moment(coupons.expiryDate).format("DD/MM/YYYY")
        })) 
    
        console.log(coupons);
        res.render("couponList" , {coupons})
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddCoupon = async(req,res)=>{
    try {
        
        res.render("addCoupon")
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupon = async(req,res)=>{
    try { 
        console.log(req.body.couponName);
        console.log(req.body.percentage);
        console.log(req.body.minimumPurchase);
        console.log(req.body.expiryDate);
        
        const expiryDate = moment(req.body.expiryDate).toISOString() 
        const today = moment().startOf('day').toISOString()
        const findCoupon =  await coupon.findOne({name:req.body.couponName})
        if(findCoupon){
            res.render("addCoupon" , {message:"This coupon already exist"})
        } else if(req.body.percentage<1 ||req.body.percentage>99 ){
            res.render("addCoupon" , {message:"Enter Percentage between 1 and 99"})
        }else if(!moment(expiryDate).isValid()||moment(expiryDate).isBefore(today)){
            res.render("addCoupon" , {message:"Enter a valid date"})
        }else{
            
            const newCoupon = new coupon({
                name:req.body.couponName,
                percentage:req.body.percentage,
                minimum:req.body. minimumPurchase,
                maximum:req.body.maximumDiscount,
                expiryDate:expiryDate
            })
            
                await newCoupon.save()
            console.log("copnnetntdt");
            if(newCoupon){
                res.redirect("/admin/couponList")
            }else{
                res.render("addCoupon", {message:"Adding coupon failed"})
            }
        }
    } catch (error) {
        console.log(error);
    }
}

const applyCoupon = async(req,res)=>{
    try {
       
        const{cartId , couponName , totalPrice} = req.body
        const userid = decode(req.cookies.jwt).id
        console.log(parseInt(totalPrice));
        const newtotalPrice = parseInt(totalPrice)
        let Coupon
        const findCoupon = await coupon.findOne({name:couponName})
        if(findCoupon){
            
        
        console.log(findCoupon);
        const findCart= await cart.findOne({_id:cartId}).populate('couponId')
        const minTotalPrice = findCoupon.minimum
        console.log("appucop")
        if(newtotalPrice>=minTotalPrice){
            Coupon = await coupon.findOne({name:couponName})
        }else{
            res.json({message:`Coupon is valid only for purchase above ${minTotalPrice}`})
        }
        let today = moment().toISOString()
        if(findCart.isCouponApplied){
            console.log('coupon applied');
            res.json({message:`This Coupon ${findCart.couponId.name} is already applied`}) 
        }else{
          if(Coupon){
            if(Coupon.isActive && moment(Coupon.expiryDate).isAfter(today)){
                if(Coupon.userId.includes(userid)){
                    res.json({message:`User already used the coupon`})
                }else{
                    const updateCartCoupon = await cart.findByIdAndUpdate({_id:findCart._id},
                        {
                            $set:{
                                couponId:Coupon._id,
                                isCouponApplied:true
                            }
                        }
                        )

                        const updateCoupon = await coupon.findByIdAndUpdate({_id:Coupon._id},
                            {
                                $push:{
                                    userId:userid
                                }
                            }
                            )
                            if(updateCartCoupon && updateCoupon){
                                res.json('success')
                            }
                }
            }else{
                res.json("Coupon expired")
            }   
        }else{
            res.json("Invalid Coupon")
        }
    }
}else{
    console.log("no such coupon");
    res.json( { message:`This coupon ${couponName} does not exist`})
}
      
    } catch (error) {
        console.log(error.message);
    }
}

const removeCoupon = async(req,res)=>{
    try {
        const userid = decode(req.cookies.jwt).id
        const findCart = await cart.findOne({_id:req.body.cartId})
        const removeId = await coupon.findOneAndUpdate({_id:findCart.couponId},
            {
                $pull:{
                    userId:userid
                }
            }
            )
            const updateCart = await cart.findOneAndUpdate({_id:req.body.cartId}, 
                {
                    isCouponApplied:false,
                    $unset:{
                        couponId:findCart.couponId
                    }
                }
                )
                if(removeId && updateCart){
                    res.json("success")
                }
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCoupon = async(req,res)=>{
    try {
        const{couponId}= req.body
        const findCoupon = await coupon.findByIdAndDelete({_id:couponId})
        if(findCoupon){
            res.json("success")
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={ 
    loadcouponList,
    loadAddCoupon,
    addCoupon,
    applyCoupon,
    removeCoupon,
    deleteCoupon
}