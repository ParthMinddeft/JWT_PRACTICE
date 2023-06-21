const nodemailer = require("nodemailer");
const {mail} = require('../contracts/contracts');
const transporter = nodemailer.createTransport(mail);

module.exports.sendMail = async(params) => {
    try{
        let info = await transporter.sendMail({
            from:mail.auth.user,
            to:params.to,
            subject:'Hello',    
            html: `
            <div
                class="container"
                style="max-width: 90%; margin: auto; padding-top: 20px"
            >
                <h2>Welcome</h2>
                <h4>You are officially</h4>
                <p style="margin-bottom: 30px;">Pleas enter the sign up OTP to get started</p>
                <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${params.OTP}</h1>
                <p style="margin-top:50px;">If you do not request for verification please do not respond to the mail. You can in turn un subscribe to the mailing list and we will never bother you again.</p>
            </div>
            `,
        });
        return info;
    }catch(error)
    {
        console.log(error);
        return false;
    }
};