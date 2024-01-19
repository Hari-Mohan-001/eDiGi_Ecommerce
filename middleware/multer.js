const multer = require("multer")
const path = require("path")

const imageTypes = /jpeg|jpg|svg|png|webp/

const storage = multer.diskStorage({
    destination: (req,file , cb)=>{
        cb(null , path.join(__dirname , "../public/product-Images"))
    },
    filename: (req,file,cb)=>{
        const name = Date.now()+"-"+file.originalname
        cb(null , name)
    }
})

const upload = multer({
    storage:storage,
    fileFilter : (req , file , cb)=>{
        const extName = imageTypes.test(path.extname(file.originalname).toLowerCase())
        const mimeType = imageTypes.test(file.mimetype)
        console.log("image1");
        if(extName && mimeType){
            console.log("image");
            return cb(null , true)
        }else{
           req.res.render("addCategory", {message:"Please upload an image file"})
        }

    }
})

module.exports = upload