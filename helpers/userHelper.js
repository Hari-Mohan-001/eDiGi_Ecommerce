const bcrypt = require("bcrypt")

const securePassword = async (password)=>{
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = await bcrypt.hash(password,salt)
    return hashedPassword
}

const comparePasswords = async(password , confirmPassword)=>{
   return await bcrypt.compare(password , confirmPassword)
}

module.exports = {
    securePassword,
    comparePasswords
}