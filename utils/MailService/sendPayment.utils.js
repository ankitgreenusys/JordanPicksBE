const nodemailer = require("nodemailer");
const SibApiV3Sdk = require("@getbrevo/brevo");

const emailtemplatepayment = (name, transactionId, amount, date) => {
  return `<div>
  <p>Dear ${name},</p>
  <p>We are pleased to inform you that we have received your payment. Here are the details:</p>
  <table>
      <tr>
          <td>Package Name:</td>
          <td>${transactionId}</td>
      </tr>
      <tr>
          <td>Amount:</td>
          <td>${amount}</td>
      </tr>
      <tr>
          <td>Date:</td>
          <td>${date}</td>
      </tr>
  </table>
  <p>If you have any questions or concerns about this transaction, please do not hesitate to contact us at <a href="mailto:${process.env.SUPPORT_MAIL}">${process.env.SUPPORT_MAIL}</a>.</p>
  <p>Thank you for your payment!</p>
  <p>Best regards,</p>
  <p>Jordan and the Jordanspicks.com team</p>
</div>`;
};

// const sendOTP = async (email, name, transactionId, amount, date, title) => {
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
//       html: emailtemplatepayment(name, transactionId, amount, date),
//     };

//     const result = await transporter.sendMail(mailOptions);
//     // console.log(result);
//     return result;
//   } catch (error) {
//     console.log(error);
//   }
// };

const sendPayment = async (email, name, transactionId, amount, date, title) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const apiKey = apiInstance.authentications["apiKey"];
    apiKey.apiKey = process.env.MAIL_API;
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = title;
    sendSmtpEmail.htmlContent = emailtemplatepayment(
      name,
      transactionId,
      amount,
      date
    );
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

module.exports = sendPayment;
// export default sendOTP;
