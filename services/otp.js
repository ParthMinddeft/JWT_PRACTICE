const otpGenerator = require('otp-generator');
const {otp_length,otp_config} = require('../contracts/contracts');
module.exports.generateOTP = () => {
    const OTP = otpGenerator.generate(otp_length,otp_config);
    return OTP;
};