const nodemailer = require("nodemailer");
const SibApiV3Sdk = require("@getbrevo/brevo");

const emailTemplateResetPassword = (name, otp) => {
  return `<div>
    <p>Dear ${name},</p>
    <p>We have received a request to reset your password. Please use the following OTP (One-Time Password) to proceed:</p>
    <h2>${otp}</h2>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>If you have any questions or concerns, please contact our support team at <a href="mailto:${process.env.SUPPORT_MAIL}">${process.env.SUPPORT_MAIL}</a>.</p>
    <p>Thank you!</p>
    <p>Best regards,</p>
    <p>The Jordanspicks.com Team</p>
</div>`;
};

// const sendResetPassword = async (email, name, otp, title) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.MAIL_HOST,
//       port: process.env.MAIL_PORT,
//       secure: true,
//       auth: {
//         user: process.env.MAIL_EMAIL,
//         pass: process.env.MAIL_PASSWORD,
//         // refreshToken: process.env.REFRESH_TOKEN,
//       },
//       tls: {
//         ciphers: "SSLv3",
//       },
//     });

//     const mailOptions = {
//       from: { name: process.env.MAIL_USER, address: process.env.MAIL_EMAIL },
//       to: email,
//       subject: title,
//       html: emailTemplateResetPassword(name, otp),
//     };

//     const result = await transporter.sendMail(mailOptions);
//     // console.log(result);
//     return result;
//   } catch (error) {
//     console.log(error);
//     throw new error(error.message)
//   }
// };

const sendResetPassword = async (email, name, otp, title) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const apiKey = apiInstance.authentications["apiKey"];
    apiKey.apiKey = process.env.MAIL_API;
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = title;
    sendSmtpEmail.htmlContent = emailTemplateResetPassword(name, otp);
    sendSmtpEmail.sender = {
      name: process.env.MAIL_USER,
      email: process.env.MAIL_EMAIL,
    };
    sendSmtpEmail.to = [{ email: email }];
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    // console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    throw new error(error.message);
  }
};

module.exports = sendResetPassword;
// export default sendOTP;
