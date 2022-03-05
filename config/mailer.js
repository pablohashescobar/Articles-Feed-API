const nodemailer = require('nodemailer');

const sendMailer = async (mailOptions) => {

    const sender = process.env.EMAIL_SENDER;
    const password = process.env.EMAIL_PASSWORD;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: sender,
            pass: password
        }
    });


    try {
        console.log("Attempting to send mail...");


        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};


module.exports = sendMailer;