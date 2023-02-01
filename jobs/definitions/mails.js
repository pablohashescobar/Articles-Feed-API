const JobHandlers = require("../handlers");

const mailDefinitions = (agenda) => {
  agenda.define(
    "send-otp-mail",
    { priority: "high", concurrency: 10 },
    JobHandlers.sendOtp
  );

  agenda.define(
    "send-forgot-password-mail",
    { priority: "high", concurrency: 10 },
    JobHandlers.sendForgotPasswordMail
  );
};

module.exports = mailDefinitions;
