const user = require("../model/userModel");
const category = require("../model/categoryModel");
const product = require("../model/productModel");
const adminJwt = require("jsonwebtoken");
const order = require("../model/orderModel");
const moment = require("moment");
const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

const maxAge = 3 * 24 * 60 * 60;
const createToken = (email) => {
  return adminJwt.sign({ email }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: maxAge,
  });
};

const loadAdminLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // const findAdmin = await admin.findOne({ email });
    // console.log(findAdmin);
    const adminData = {
      email: adminEmail,
      password: adminPassword,
    };
    if (email === adminData.email && password === adminData.password) {
      const token = createToken(email);
      res.cookie("adminjwt", token, { httpOnly: true, maxAge: maxAge * 1000 });

      res.json({success:true})
    } else {
      res.json({success:false , message:'Invalid Credentials'})

    }
  } catch (error) {
    console.log(error.message);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await user.find();
    res.render("usersList", { users: users });
  } catch (error) {
    console.log(error.message);
  }
};

const blockUser = async (req, res) => {
  try {
    console.log("block");
    const id = req.query.id;
    const blockuser = await user.findByIdAndUpdate(
      { _id: id },
      { $set: { blocked: true } }
    );
    res.redirect("/admin/usersList");
  } catch (error) {
    console.log(error.message);
  }
};

const unblockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const unblockuser = await user.findByIdAndUpdate(
      { _id: id },
      { $set: { blocked: false } }
    );
    res.redirect("/admin/usersList");
  } catch (error) {
    console.log(error.message);
  }
};

// const getSingleUser = async(req,res)=>{
//     try {
//         const id = req.query.id
//         const user1 = await admin.findOne({_id:id})
//         res.json(user1)
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const loadCategoryList = async (req, res) => {
  try {
    const categoryList = await category.find();
    console.log(categoryList);
    res.render("categoryList", { categories: categoryList });
  } catch (error) {
    console.log(error.message);
  }
};

const loadAddCategory = async (req, res) => {
  try {
    res.render("addCategory");
  } catch (error) {
    console.log(error.message);
  }
};

const addNewCategory = async (req, res) => {
  try {
    const categoryName = req.body.categoryName;
    const findCategory = await category.find({
      name: { $regex: new RegExp("^" + categoryName + "$", "i") },
    });
    // const findCategory = await category.find({name:categoryName})
    console.log(findCategory);
    console.log("found");
    if (findCategory.length > 0) {
      res.render("addCategory", {
        message: `This Category - ${categoryName} already exist, No dupilcate category allowed`,
      });
    } else {
      console.log("not found");
      const Category = new category({
        name: categoryName,
        image: req.file.filename,
      });
      const newCategory = await Category.save();
      console.log("added");
      if (newCategory) {
        res.redirect("/admin/categoryList");
      } else {
        res.render("addCategory", {
          message: "Category adding failed, please try again",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadProductList = async (req, res) => {
  try {
    const categories = await category.find();
    const Product = await product.find().populate("categoryname");
    // const Category = await category.find();
    console.log("product list");
    res.render("productList", { products: Product });
  } catch (error) {
    console.log(error.message);
  }
};

const loadAddProduct = async (req, res) => {
  try {
    const Category = await category.find({ isBlocked: false });
    res.render("addProduct", { categories: Category });
  } catch (error) {
    console.log(error.message);
  }
};

const addNewProduct = async (req, res) => {
  try {
    const Category = await category.find({ isBlocked: false });

    const newprice = parseFloat(req.body.price);
    const newStock = parseFloat(req.body.stock);

    if (newprice <= 0 || newStock <= 0) {
      res.render("addProduct", {
        categories: Category,
        message: "Price & stock should be greater than zero",
      });
    } else {

      const processedImages = await Promise.all(req.files.map(async(file)=>{
        const originalFileName = file.originalname;
        const croppedImageBuffer = await sharp(file.path)
        .resize({ width: 300, height: 250 }) // Resize the image
               
                .toBuffer(); // Convert to buffer

                const filename = path.basename(originalFileName);

                // Save the cropped image to a directory
        const croppedImagePath = path.join(__dirname, '../public/cropped_images', filename);
        fs.writeFileSync(croppedImagePath, croppedImageBuffer);

        // Return the path of the cropped image
        return filename;
      }))

      // const images = req.files.map((file)=>{
      //   return file.filename
      // })

      // const files = req.files;

      // const listOfImageNames = Object.entries(files).map(
      //   (arr) => arr[1][0].filename
      // );

      console.log("product route");
      const Product = new product({
        productName: req.body.productName,
        categoryname: req.body.categoryName,
        description: req.body.description,
        brand: req.body.brand,
        image:processedImages,
        price: newprice,
        stock: req.body.stock,
      });
      const newProduct = await Product.save();
      console.log(newProduct);
      res.redirect("/admin/addProduct");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadUpdateProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await product.findById({ _id: id });
    if (productData) {
      console.log("product data");
      res.render("updateProducts", { products: productData });
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    // const images = req.files.map((file) => {
    //   return file.filename;
    // });

    const images = await Promise.all(req.files.map(async(file)=>{
      const originalFileName = file.originalname;
      const croppedImageBuffer = await sharp(file.path)
      .resize({ width: 300, height: 250 }) // Resize the image
             
              .toBuffer(); // Convert to buffer

              const filename = path.basename(originalFileName);

              // Save the cropped image to a directory
      const croppedImagePath = path.join(__dirname, '../public/cropped_images', filename);
      fs.writeFileSync(croppedImagePath, croppedImageBuffer);

      // Return the path of the cropped image
      return filename;
    }))

    const dataUpdate = {
      $set: {
        productName: req.body.productName,
        description: req.body.description,
        brand: req.body.brand,
        price: req.body.price,
        stock: req.body.stock,
      },
    };

    if (images.length > 0) {
      dataUpdate.$push = { image: { $each: images } };
    }

    const productDataUpdate = await product.findByIdAndUpdate(
      { _id: req.body.id },
      dataUpdate
    );
    res.redirect("/admin/productList");
  } catch (error) {
    console.log(error.message);
  }
};

const loadAdminDashboard = async (req, res) => {
  try {
    const products = await product.countDocuments({ isBlocked: false }).exec();
    console.log("countproducts" + products);

    const pipeLine = [
      {
        $match: {
          orderStatus: {
            $in: ["Delivered"],
          },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ];
    const orders = await order.aggregate(pipeLine);
    console.log(orders);
    const orderCount = orders[0].count;
    const revenue = orders[0].totalRevenue;

    const users = await user.countDocuments();
    console.log(orders);
    res.render("adminDashboard", { products, orderCount, revenue, users });
  } catch (error) {
    console.log(error.message);
  }
};

const chartData = async (req, res) => {
  try {
    let timeBaseForSalesChart = req.query.salesChart;
    let timeBaseForOrderNoChart = req.query.orderChart;

    function getDatesAndQueryData(timeBaseForChart, chartType) {
      let startDate, endDate;
      let groupingQuery, sortQuery;

      if (timeBaseForChart === "yearly") {
        startDate = new Date(new Date().getFullYear(), 0, 1);
        endDate = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);

        groupingQuery = {
          _id: {
            month: { $month: { $toDate: "$orderedAt" } },
            year: { $year: { $toDate: "$orderedAt" } },
          },
          totalSales: { $sum: "$totalPrice" },
          totalOrder: { $sum: 1 },
        };

        sortQuery = { "_id.year": 1, "_id.month": 1 };
      }

      if (timeBaseForChart === "weekly") {
        startDate = new Date();

        endDate = new Date();

        const timezoneOffset = startDate.getTimezoneOffset();

        startDate.setDate(startDate.getDate() - 6);

        startDate.setUTCHours(0, 0, 0, 0);

        startDate.setUTCMinutes(startDate.getUTCMinutes() + timezoneOffset);

        endDate.setUTCHours(0, 0, 0, 0);

        endDate.setDate(endDate.getDate() + 1);

        endDate.setUTCMinutes(endDate.getUTCMinutes() + timezoneOffset);

        groupingQuery = {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$orderedAt" },
          },
          totalSales: { $sum: "$totalPrice" },
          totalOrder: { $sum: 1 },
        };

        sortQuery = { _id: 1 };
      }

      if (timeBaseForChart === "daily") {
        startDate = new Date();
        endDate = new Date();

        const timezoneOffset = startDate.getTimezoneOffset();

        startDate.setUTCHours(0, 0, 0, 0);

        endDate.setUTCHours(0, 0, 0, 0);

        endDate.setDate(endDate.getDate() + 1);

        startDate.setUTCMinutes(startDate.getUTCMinutes() + timezoneOffset);

        endDate.setUTCMinutes(endDate.getUTCMinutes() + timezoneOffset);

        groupingQuery = {
          _id: { $hour: "$orderedAt" },
          totalSales: { $sum: "$totalPrice" },
          totalOrder: { $sum: 1 },
        };

        sortQuery = { "_id.hour": 1 };
      }

      if (chartType === "sales") {
        return { groupingQuery, sortQuery, startDate, endDate };
      } else if (chartType === "orderNoChart") {
        return { groupingQuery, sortQuery, startDate, endDate };
      }
    }

    const salesChartInfo = getDatesAndQueryData(timeBaseForSalesChart, "sales");
    const orderNoChartInfo = getDatesAndQueryData( timeBaseForOrderNoChart,"orderNoChart");

    let salesChartData = await order
      .aggregate([
        {
          $match: {
            $and: [
              {
                orderedAt: {
                  $gte: salesChartInfo.startDate,
                  $lte: salesChartInfo.endDate,
                },
                orderStatus: {
                  $nin: ["cancelled"],
                },
              },
            ],
          },
        },

        {
          $group: salesChartInfo.groupingQuery,
        },
        {
          $sort: salesChartInfo.sortQuery,
        },
      ])
      .exec();

    let orderNoChartData = await order
      .aggregate([
        {
          $match: {
            $and: [
              {
                orderedAt: {
                  $gte: orderNoChartInfo.startDate,
                  $lte: orderNoChartInfo.endDate,
                },
                orderStatus: {
                  $nin: ["cancelled"],
                },
              },
            ],
          },
        },

        {
          $group: orderNoChartInfo.groupingQuery,
        },
        {
          $sort: orderNoChartInfo.sortQuery,
        },
      ])
      .exec();

    let saleChartInfo = {
      timeBasis: timeBaseForSalesChart,
      data: salesChartData,
    };
    let orderQuantityChartInfo = {
      timeBasis: timeBaseForOrderNoChart,
      data: orderNoChartData,
    };

    return res.status(200).json({ saleChartInfo, orderQuantityChartInfo });
  } catch (error) {
    console.log(error.message);
  }
};

const loadSalesReport = async (req, res) => {
  try {
    let Order;
    if (req.query.startDate && req.query.endDate) {
      console.log(req.query.startDate);
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
      console.log(startDate);
      console.log(endDate);

      Order = await order
        .find({
          orderedAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $in: ["Shipped", "Delivered"] },
        })
        .populate("costumer");
        console.log(Order);
    } else {
      Order = await order
        .find({ orderStatus: { $in: ["Shipped", "Delivered"] } })
        .populate("costumer");
    }

    const totalValue = Order.reduce(
      (total, value) => total + value.totalPrice,
      0
    );
    Order = Order.map((Order) => ({
      ...Order.toObject(),
      orderDate: moment(Order.orderedAt).format("DD/MM/YYYY"),
    }));
    res.render("salesReport", { orders: Order, totalValue, moment });
  } catch (error) {
    console.log(error);
  }
};

const adminLogout = async (re, res) => {
  try {
    res.cookie("adminjwt", "", { maxAge: 1 });
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadAdminLogin,
  verifyLogin,
  loadAdminDashboard,
  getAllUsers,
  blockUser,
  loadCategoryList,
  loadAddCategory,
  addNewCategory,
  loadProductList,
  loadAddProduct,
  unblockUser,
  addNewProduct,
  loadUpdateProduct,
  updateProduct,
  adminLogout,
  loadSalesReport,
  chartData,
};
