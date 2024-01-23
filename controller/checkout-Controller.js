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
          coupons:allCoupons
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
          coupons:allCoupons
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
    const userId = new ObjectId(decode(req.cookies.jwt).id);
    const User = await user.findById({ _id: userId });
    const findCart = await cart
      .findOne({ userid: userId })
      .populate("couponId");
    const { cartTotal, productTotal, findProducts } =
      await productHelpers.totalPrice(req);
    console.log("checkout");
    console.log(req.body.payment);
  
    if (findCart.isCouponApplied) {
      let discount = (cartTotal[0].total * findCart.couponId.percentage) / 100;
      const totalAfterDiscount = cartTotal[0].total - discount;

      const newOrder = await new order({ 
        costumer: userId,
        address: req.body.selectedAddress||req.body.address,
        items: findProducts,
        totalPrice: totalAfterDiscount,
        discount: discount,
        payment: req.body.payment,
        orderedAt: new Date(),
        isCouponApplied: true,
        couponId: findCart.couponId,
      });

      const createNewOrder = await newOrder.save();
      console.log(createNewOrder);
      if (createNewOrder) {
        for (let i = 0; i < findProducts.length; i++) {
          const productId = findProducts[i].Product;
          const quantityPurchased = findProducts[i].quantity;
          const updateProduct = product.findOne(
            { _id: productId },
            {
              $inc: {
                stock: -quantityPurchased,
              },
            }
          );
        }

        const deleteCart = await cart.findOneAndDelete({ userid: userId });
        if (req.body.payment === "Cash on delivery") {
         return res.redirect("/orderSuccess");
        }else{
            console.log("cop online");
            const upadteStatus = await order.findOneAndUpdate({_id:createNewOrder._id},
              {
                $set:{
                  orderStatus:"Placed"
                }
              }
              )
            res.status(200).json("Success")

        }
      }
    } else {
      const newOrder = await new order({
        costumer: userId,
        address: req.body.selectedAddress||req.body.address,
        items: findProducts,
        totalPrice: cartTotal[0].total,
        payment: req.body.payment,
        orderedAt: new Date(),
      }); 

      const createNewOrder = await newOrder.save();
      console.log("stock update1111");
      if (createNewOrder) {
        for (let i = 0; i < findProducts.length; i++) {
          const productId = findProducts[i].Product;
          const quantityPurchased = findProducts[i].quantity;
          console.log("stock update");
          console.log(quantityPurchased);
          const updateProduct = await product.findOneAndUpdate(
            { _id: productId },
            {
              $inc: {
                stock: -quantityPurchased, 
              },
            }
          );
        }

        const deleteCart = await cart.findOneAndDelete({ userid: userId });   
        if (createNewOrder.payment === "Cash on delivery") {
          return  res.redirect("/orderSuccess");
          }else{
              console.log("online");

              const upadteStatus = await order.findOneAndUpdate({_id:createNewOrder._id},
                {
                  $set:{
                    orderStatus:"Placed"
                  }
                }
                )

            res.status(200).json("success")
              
          }
        
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

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
};

module.exports = {
  loadCheckout,
  createOrder,
  orderSuccess,
};
