const Razorpay = require("razorpay")
let crypto = require("crypto")

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });


  const generateRazorpay = async(req,res)=>{
console.log("razorpay");
    var options = {
        amount: req.body.amount,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "receipt1"
      };
      instance.orders.create(options, function(err, order) {
        if(err){
          console.log(err);
        }
        console.log( "razor" ,order);
        res.json({orderId:order.id})
      });
         
  }

  const razorpayVerifyOrder = async(req,res)=>{
    console.log(req.body);
    
     let body = req.body.response.razorpay_order_id +"|"+ req.body.response.razorpay_payment_id
     let signature = crypto.createHmac('sha256' , process.env.RAZORPAY_KEY_SECRET)
        signature =  signature.update(body.toString()).digest('hex')
        console.log('sigmade'+signature);
        
        let response ={"signatureIsValid":"false"}
        if(signature ===req.body.response.razorpay_signature){
           response ={"signatureIsValid":"true"}
         return res.json(response) 
        }else{
          console.log('not verified');
        }
  }

  const sample =async(req,res)=>{
    try {
      res.render("samplePage")
    } catch (error) {
      console.log(error.message);
    }
  }

  module.exports = {
    generateRazorpay,
    razorpayVerifyOrder,
    sample

  }