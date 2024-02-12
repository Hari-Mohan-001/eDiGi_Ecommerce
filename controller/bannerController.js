const banner = require("../model/bannerModel")

const laodBanners = async(req,res, next)=>{
    try {
        const banners = await banner.find()
        res.render("banner",{banners})
    } catch (error) {
        next(error)
    }
}

const loadAddBanner = async(req,res,next)=>{
    try {
        res.render("addBanner")
    } catch (error) {
        console.log(error.message); 
    }
}

const addBanner = async(req,res,next)=>{
    try {
        const file = req.file
        const {name , description}= req.body
console.log(name , description);
        const Banner = new banner({
            name:name,
            description:description,
            image:file.filename,
            isActive:true,
            createdAt:Date.now()
        })
        const newBanner = await Banner.save()
        if(newBanner){
           return res.json({success:true})
        }
    } catch (error) {
        next(error)
    }
}

const bannerManagement = async(req,res,next)=>{
    try {
        const{bannerId} = req.body
        const findBanner = await banner.findById({_id:bannerId})
        let upadatedBanner
        if(findBanner.isActive){
            upadatedBanner= await banner.findByIdAndUpdate({_id:bannerId},
                {
                    $set:{
                        isActive:false
                    }
                }
                )
        }else{
            upadatedBanner= await findBanner.updateOne({$set:{isActive:true}})
        }
        if(upadatedBanner){
            res.json({success:true})
        }else{
            res.json({success:false})
        }
        
    } catch (error) {
        next(error)
    }
}

module.exports ={
    laodBanners,
    loadAddBanner,
    addBanner,
    bannerManagement
}