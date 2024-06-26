const nodemailer = require("nodemailer");
const SibApiV3Sdk = require("@getbrevo/brevo");

const emailtemplateotp = (name, data) => {
  return `<div>
    <p>Dear ${name},</p>
    ${data}
    <p>If you have any questions or concerns, please contact our support team at <a href="mailto:${process.env.SUPPORT_MAIL}">${process.env.SUPPORT_MAIL}</a>.</p>
</div>`;
};

// const sendOTP = async (email, name, data, title) => {
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
//     });

//     const mailOptions = {
//       from: { name: process.env.MAIL_USER, address: process.env.MAIL_EMAIL },
//       to: email,
//       subject: title,
//       html: emailtemplateotp(name, data),
//     };

//     const result = await transporter.sendMail(mailOptions);
//     // console.log(result);
//     return result;
//   } catch (error) {
//     console.log(error);
//   }
// };

const sendCustomMsg = async (email, name, data, title) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const apiKey = apiInstance.authentications["apiKey"];
    apiKey.apiKey = process.env.MAIL_API;
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = title;
    sendSmtpEmail.htmlContent = emailtemplateotp(name, data);
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
  }
};

module.exports = sendCustomMsg;
// export default sendOTP;
