const nodemailer = require("nodemailer");
const SibApiV3Sdk = require("@getbrevo/brevo");

const emailtemplateotp = (link) => {
  return `
  <body
    style="margin: 0; font-family: 'open sans', 'helvetica neue', sans-serif"
  >
    <main style="padding: 2rem">
      <div
        style="
          font-style: italic;
          color: gray;
          text-align: center;
          margin-bottom: 2rem;
        "
      >
        Welcome to JordansPicks
      </div>
      <section
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #1d1d1d;
          color: white;
          padding: 5rem 3rem;
        "
      >
        <div
          style="
            margin-top: 3rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          "
        >
          <div
            style="
              background-color: black;
              letter-spacing: 0.5rem;
              padding: 0.5rem 0.25rem;
              font-weight: 600;
            "
          >
            Bonus
          </div>
          <h1
            style="font-size: 3rem; margin: 0.5rem 0; letter-spacing: 1.75rem; color: #E91E63;"
          >
            Rewards
          </h1>
          <div
            style="font-size: 1rem; font-weight: 600; letter-spacing: 0.5rem"
          >
            DON'T MISS
          </div>
        </div>
        <div style="margin-top: 4rem">
          <h2
            style="
              font-size: 2rem;
              margin: 0.75rem 0;
              text-align: center;
              letter-spacing: 0.5rem;
              color: #E91E63;
            "
          >
            $ 25
          </h2>
          <div style="font-size: 1rem; font-weight: 600; text-align: center">
            Signing Bonus
          </div>
          <div style="font-size: 1rem; font-weight: 600; text-align: center">
            One time offer
          </div>
        </div>
      </section>
      <section
        style="
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-top: solid 1px lightgrey;
          padding: 2rem;
        "
      >
        <div
          style="
            font-size: 1.5rem;
            font-weight: 600;
            text-align: center;
            letter-spacing: 0.25rem;
          "
        >
          LIMITED TIME OFFER
        </div>
        <p
          style="
            text-align: center;
            font-style: italic;
            margin: 1rem;
            color: grey;
          "
        >
          Unbeatable deals for your betting needs at JordansPicks.
        </p>
        <div style="margin: 1rem 0">
          <a
          href=${process.env.APP_URL + link}
            style="
              outline: none;
              border: none;
              border-bottom: solid 0.15rem #E91E63;
              background-color: transparent;
              font-size: 0.88rem;
              font-weight: 600;
              color: #E91E63;
              cursor: pointer;
              padding: 0.5rem 1rem;
            "
          >
            Claim your bonus
          </a>
        </div>
      </section>
    </main>
    <footer style="background-color: rgb(224, 250, 250); padding: 2rem 1.5rem">
      <div
        style="
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          style="height: 1.5rem; width: 1.5rem"
        >
          <!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path
            d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          style="height: 1.5rem; width: 1.5rem"
        >
          <!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path
            d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          style="height: 1.5rem; width: 1.5rem"
        >
          <!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path
            d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 576 512"
          style="height: 1.5rem; width: 1.5rem"
        >
          <!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path
            d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"
          />
        </svg>
      </div>
      <div style="text-align: center; font-style: italic; margin-top: 1.5rem">
        JordansPicks Best Betting site
      </div>
      <hr style="width: 50%" />
    </footer>
  </body>
  `;
};

// const sendOTP = async (email, otp, title) => {
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
//       html: emailtemplateotp(otp),
//     };

//     const result = await transporter.sendMail(mailOptions);
//     // console.log(result);
//     return result;
//   } catch (error) {
//     console.log(error);
//   }
// };

const sendOTP = async (email, otp, title) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const apiKey = apiInstance.authentications["apiKey"];
    apiKey.apiKey = process.env.MAIL_API;
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = title;
    sendSmtpEmail.htmlContent = emailtemplateotp(otp);
    sendSmtpEmail.sender = {
      name: process.env.MAIL_USER,
      email: process.env.MAIL_EMAIL,
    };
    sendSmtpEmail.to = [{ email: email }];
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendOTP;
// export default sendOTP;
