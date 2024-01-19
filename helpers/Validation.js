const {check} = require("express-validator")

exports.userValidator = [
    check("name" , "Name is required").not().isEmpty(),
    check("email" , "Enter a valid email").isEmail().normalizeEmail({
        gmail_remove_dots:true
    }),
    check("mobile" , "Mobile number should contain 10 numbers").isLength({
        min:10,
        max:10
    }),
    check("password" , "Password must contain atleast 6 characters, one number, one special character, one uppercase and lower case letter").isStrongPassword({
        minLength:6,
        minLowercase:1,
        minUppercase:1,
        minNumbers:1,
        minSymbols:1
    })
]