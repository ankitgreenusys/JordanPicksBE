const nodemailer = require("nodemailer");

const emailtemplateotp = (name) => {
  return `<>
    Hi ${{ name }},
    Thank you for signing up to Jordanspicks.com, the ultimate destination for sports betting enthusiasts!
    You have made a smart choice by joining our community of winners. As a valued member, you will enjoy the following benefits:
    - Access to amazing sports pick packages for various leagues and events, including NFL, NBA, MLB, NHL, UFC, and more!
    - Penthouse Club Telegram Channel, get insider tips, and receive special offers and bonuses!
    - Unlimited access to daily content, such as articles,  expert analysis, predictions, and advice from Jordan and her team!
    - Profit Guarantee on every standard package you purchase. If the bet loses, you get a store credit right back automatically on your account. No muss no fuss.
    To get started, simply log in to your account and browse our selection of sports pick packages. Choose the one that suits your budget and preferences, and place your bets with confidence. You can also join the Penthouse Club Telegram Channel by clicking the link in your account dashboard.
    We are thrilled to have you on board and we look forward to helping you win big!
    If you have any questions or feedback, please feel free to contact us at support@jordanspicks.com. We are always happy to hear from you.
    Happy betting!
    Jordan and the Jordanspicks.com team
  </>`;
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
