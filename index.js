const express = require("express")
const app = express()
const dotenv = require("dotenv").config()
const dbConnection = require("./config/dbConnect")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")
const PORT = process.env.PORT || 3001

dbConnection.dbConnect()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

// app.use(morgan)

app.set("view engine" , "ejs")
app.set("views", ["./views/admin" , "./views/users"])

app.use(express.static("public"))

app.use(cookieParser())


const userRoute = require("./routes/user-Route")
app.use("/",userRoute) 

const adminRoute = require("./routes/admin-Route")
app.use("/admin",adminRoute) 

const { notFound, errorHandler } = require("./middleware/errorHandler")
app.use("*" ,notFound)
app.use(errorHandler)


app.listen(PORT ,()=>{ 
    console.log(`The sever is running at port ${PORT}`);
})
  