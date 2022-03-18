const agenda = require("./ajenda");

const schedule = {
  sendOtp: async (data) => {
    console.log("Sending OTP to::");
    await agenda.now("send-otp-mail", data);
  },
  sendForgotPasswordMail: async (data) => {
    await agenda.now("send-forgot-password-mail", data);
  },
    optimizeImage: async (data) => {
    await agenda.now("optimize-image", data);
  }
};

module.exports = schedule;
