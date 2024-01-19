const jwt = require("jsonwebtoken");

const tokenVerify = async (req, res, next) => {
  try {
    const token = req.cookies.adminjwt;
    if (token) {
      await jwt.verify(
        token,
        process.env.ADMIN_JWT_SECRET,
        (err, decodedToken) => {
          if (err) {
            console.log(err);
            res.redirect("/admin/login");
          } else {
            console.log(decodedToken);
            return next();
          }
        }
      );
    } else {
      console.log("redirected");
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    const token = req.cookies.adminjwt;
    if (!token) {
      return next();
    } else {
      jwt.verify(token, process.env.ADMIN_JWT_SECRET, (err, decoded) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/admin/adminDashboard");
        }
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  tokenVerify,
  isLogout,
};
