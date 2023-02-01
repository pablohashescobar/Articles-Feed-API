const nodemailer = require("nodemailer");

const sendMailer = async (mailOptions) => {
  const sender = process.env.EMAIL_SENDER;
  const password = process.env.SENDGRID_KEY;

  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 465,
    secure: true,
    auth: {
      user: sender,
      pass: password,
    },
  });

  try {
    console.log("Attempting to send mail...");

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = sendMailer;
