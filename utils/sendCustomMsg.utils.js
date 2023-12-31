const nodemailer = require("nodemailer");

const emailtemplateotp = (name, data) => {
  return `<div>
    <p>Dear ${name},</p>
    ${data}
    <p>If you have any questions or concerns, please contact our support team at <a href="mailto:support@jordanspicks.com">support@jordanspicks.com</a>.</p>
</div>`;
};

const sendOTP = async (email, otp, title) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
        // refreshToken: process.env.REFRESH_TOKEN,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_EMAIL,
      to: email,
      subject: title,
      html: emailtemplateotp(otp),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendOTP;
// export default sendOTP;
