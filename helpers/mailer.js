const nodeMailer = require("nodemailer")


const transpoter =  nodeMailer.createTransport({
    host:process.env.SMTP_HOST,
    port:process.env.SMTP_PORT,
    secure:false,
    requireTLS:true,
    auth:{
        user:process.env.SMTP_MAIL,
        pass:process.env.SMTP_PASSWORD
    }
    
})

const sendMail = async(email, subject ,content)=>{
    try {
        let mailOptions = {
            from:process.env.SMTP_MAIL,
            to:email, 
            subject:subject,
            html:content
        }
        transpoter.sendMail(mailOptions , (error, info)=>{
            if(error){
            console.log(error);
            }else{
                console.log("mail send", info.messageId);
            }

        })
        
    } catch (error) {
        console.log(error.message);
    }

}

const sendResetPasswordMail = async(email, subject ,content ,token , name)=>{
    try {
        let mailOptions = {
            from:process.env.SMTP_MAIL,
            to:email, 
            subject:subject,
            html:content
        }
        transpoter.sendMail(mailOptions , (error, info)=>{
            if(error){
            console.log(error);
            }else{
                console.log("mail send", info.messageId);
            }

        })
        
    } catch (error) {
        console.log(error.message);
    }

}

module.exports = {
    sendMail,
    sendResetPasswordMail
}
