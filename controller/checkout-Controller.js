const user = require("../model/userModel");
const product = require("../model/productModel");
const cart = require("../model/cartModel");
const order = require("../model/orderModel");
const coupon = require("../model/couponModel")
const { decode } = require("jsonwebtoken");
const moment =require("moment")
const productHelpers = require("../helpers/productHelpers");
const createRazorpay = require("../helpers/razorpay")
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const Razorpay = require("razorpay")



const loadCheckout = async (req, res) => {
  try {
    let count = null;
    if (req.cookies.jwt) {
      count = await cartCount(decode(req.cookies.jwt).id);
    }
    const userId = decode(req.cookies.jwt).id;
    const User = await user.findById({ _id: userId });
    const findCart = await cart
      .findOne({ userid: userId })
      .populate("couponId");

      let allCoupons = await coupon.find({isActive:true})
      allCoupons = allCoupons.map(allCoupons=> ({
        ...allCoupons.toObject(),
        expiryDate:moment(allCoupons.expiryDate).format('DD/MM/YYYY')
      }))

    if (findCart) {
      const { cartTotal, productTotal, findProducts } =
        await productHelpers.totalPrice(req);

      if (findCart.isCouponApplied) {
        const discount =
          (cartTotal[0].total * findCart.couponId.percentage) / 100;
        const totalAfterDiscount = cartTotal[0].total - discount;
        res.render("checkout", {
          address: User.address,
          products: findProducts,
          productTotal,
          cartTotal,
          count,
          findCart,
          discount,
          totalAfterDiscount,
          coupons:allCoupons,
          User
        });
      } else {
        console.log('no coupon');
        res.render("checkout", {
          address: User.address,
          products: findProducts,
          productTotal,
          cartTotal,
          count,
          findCart,
          coupons:allCoupons,
          User
        });
      }
    } else {
      res.redirect("/myCart");
    }

    console.log("carttot", cartTotal[0].total);
  } catch (error) {
    console.log(error.message);
  }
};

const createOrder = async (req, res) => {
  try {
    let balanceAmount
    let newOrder , createOrder
    const userId = new ObjectId(decode(req.cookies.jwt).id);
    const User = await user.findById({ _id: userId });
   
    const findCart = await cart
      .findOne({ userid: userId })
      .populate("couponId");
    const { cartTotal, productTotal, findProducts } =
      await productHelpers.totalPrice(req);
    
    const{payment} = req.body
    
  
    if (findCart.isCouponApplied) {
      let discount = (cartTotal[0].total * findCart.couponId.percentage) / 100;
      const totalAfterDiscount = cartTotal[0].total - discount;
       
      const walletCheckbox = req.body.walletCheckbox   
      console.log(walletCheckbox);
      const walletAmount = User.wallet
      console.log(walletAmount); 
      const walletAmountUsed = Math.min(totalAfterDiscount , walletAmount)
           balanceAmount = totalAfterDiscount-walletAmountUsed

           if(walletCheckbox==='1'){   
           
             if(balanceAmount){
              
              newOrder = await new order({ 
                costumer: userId,
                address: req.body.address,
                items: findProducts,
                totalPrice: totalAfterDiscount,
                discount: discount,
                balanceAmount:balanceAmount,
                isWalletApplied:true,
                payment: req.body.payment,
                orderedAt: new Date(),
                isCouponApplied: true,
                couponId: findCart.couponId,
              });

              createOrder = await newOrder.save()
              let userUpdate = await user.updateOne({_id:userId},
                {
                  $inc:{
                    wallet:-walletAmountUsed
                  }
                }
                )

                const history = {amount:walletAmountUsed,
                  description: 'Amount used for order purchase',
                  status:'debit',
                  date: new Date()          
             }

             const walletHistory = await user.findByIdAndUpdate({_id:userId},
              {
                  $addToSet:{
                      walletHistory:history
                  }
              }
              )

             }else{

              newOrder = await new order({ 
                costumer: userId,
                address: req.body.selectedAddress||req.body.address,
                items: findProducts,
                totalPrice: totalAfterDiscount,
                discount: discount,
                balanceAmount:balanceAmount, 
                isWalletApplied:true,
                payment: "Wallet",
                orderedAt: new Date(),
                isCouponApplied: true,
                couponId: findCart.couponId,
              });

              createOrder = await newOrder.save()
              userUpdate = await user.updateOne({_id:userId},
                {
                  $inc:{
                    wallet:-walletAmountUsed
                  }
                }
                )

                const history = {amount:walletAmountUsed,
                  description: 'Amount used for order purchase',
                  status:'debit',
                  date: new Date()          
             }

             const walletHistory = await user.findByIdAndUpdate({_id:userId},
              {
                  $addToSet:{
                      walletHistory:history
                  }
              }
              )

             }
           }else{

            newOrder = await new order({ 
              costumer: userId,
              address: req.body.selectedAddress||req.body.address,
              items: findProducts,
              totalPrice: totalAfterDiscount,
              discount: discount,
              isWalletApplied:false,
              payment: req.body.payment,
              orderedAt: new Date(),
              isCouponApplied: true,
              couponId: findCart.couponId,
            });
            createOrder = await newOrder.save()

           }

      console.log(createOrder);
      if (createOrder) {
        for (let i = 0; i < findProducts.length; i++) {
          const productId = findProducts[i].Product;
          const quantityPurchased = findProducts[i].quantity;
          const updateProduct = await product.findByIdAndUpdate(
            { _id: productId },
            {
              $inc: {
                stock: -quantityPurchased,
              },
            }
          );
        }
      }

        const deleteCart = await cart.findOneAndDelete({ userid: userId });
        if (createOrder.payment === "Cash on delivery" || createOrder.payment ==='Wallet') {
         return res.redirect("/orderSuccess");
        }else{
           
            const upadteStatus = await order.findOneAndUpdate({_id:createOrder._id},
              {
                $set:{
                  orderStatus:"Placed"
                }
              }
              )
            res.status(200).json("Success") 

        }
      
    } else {
  
      const {walletCheckbox} = req.body 
      console.log(walletCheckbox);
      const walletAmount = User.wallet
      console.log(walletAmount);
      const walletAmountUsed = Math.min(cartTotal[0].total , walletAmount)
      balanceAmount = cartTotal[0].total - walletAmountUsed
            
      if(walletCheckbox==='1'){
        if(balanceAmount){
         
         newOrder = await new order({ 
           costumer: userId,
           address: req.body.address,
           items: findProducts,
           totalPrice: cartTotal[0].total ,
           balanceAmount:balanceAmount,
           isWalletApplied:true,
           payment: req.body.payment,
           orderedAt: new Date(),
           isCouponApplied: false,
          
         });

         createOrder = await newOrder.save()
         let userUpdate = await user.updateOne({_id:userId},
           {
             $inc:{
               wallet:-walletAmountUsed
             }
           }
           )

           const history = {amount:walletAmountUsed,
            description: 'Amount used for order purchase',
            status:'debit',
            date: new Date()          
       }

       const walletHistory = await user.findByIdAndUpdate({_id:userId},
        {
            $addToSet:{
                walletHistory:history
            }
        }
        )

        }else{
          const {address} = req.body
         

         newOrder = await new order({ 
           costumer: userId,
           address: req.body.address.replace(/[\r]+/g, ''),
           items: findProducts,
           totalPrice:cartTotal[0].total,
           balanceAmount:balanceAmount,
           isWalletApplied:true,
           payment: 'Wallet',
           orderedAt: new Date(),
           isCouponApplied: false,
           
         });

         createOrder = await newOrder.save()
         userUpdate = await user.updateOne({_id:userId},
           {
             $inc:{
               wallet:-walletAmountUsed
             }
           }
           )

           const history = {amount:walletAmountUsed,
            description: 'Amount used for order purchase',
            status:'debit',
            date: new Date()          
       }

       const walletHistory = await user.findByIdAndUpdate({_id:userId},
        {
            $addToSet:{
                walletHistory:history
            }
        }
        )

        }
      }else{

       newOrder = await new order({ 
         costumer: userId,
         address: req.body.selectedAddress||req.body.address,
         items: findProducts,
         totalPrice: cartTotal[0].total,
         isWalletApplied:false,
         payment: req.body.payment,
         orderedAt: new Date(),
         isCouponApplied: false,
        
       });
       createOrder = await newOrder.save()

      }

 console.log(createOrder);
 if (createOrder) {
   for (let i = 0; i < findProducts.length; i++) {
   
     const productId = findProducts[i].Product;
     const quantityPurchased = findProducts[i].quantity;
     const updateProduct = await product.findByIdAndUpdate(
       { _id: productId },
       {
         $inc: {
           stock: -quantityPurchased,
         },
       }
     );
     
   }
 }


   const deleteCart = await cart.findOneAndDelete({ userid: userId });
   if (createOrder.payment === "Cash on delivery" || createOrder.payment ==='Wallet') {
    return res.redirect("/orderSuccess");
   }else{
       console.log("cop online");
       const upadteStatus = await order.findOneAndUpdate({_id:createOrder._id},
         {
           $set:{
             orderStatus:"Placed"
           }
         }
         )
       res.status(200).json("Success")

   }

    }
       
    
  } catch (error) {
    console.log(error.message);
  }
}

const orderSuccess = async (req, res) => {
  try {
    let count = null;
    if (req.cookies.jwt) {
      count = await cartCount(decode(req.cookies.jwt).id);
    }
    res.render("orderSuccess", { count });
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  loadCheckout,
  createOrder,
  orderSuccess,
}
