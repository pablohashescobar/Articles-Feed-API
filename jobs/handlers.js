const sendMailer = require("../services/mail_service");
const imageOptimizer = require("../services/image_service");

const JobHandlers = {
  sendOtp: async (job, done) => {
    const { data } = job.attrs;
    await sendMailer(data);
    done();
  },
  sendForgotPasswordMail: async (job, done) => {
    const { data } = job.attrs;
    await sendMailer(data);
    done();
  },
  optimizeImage: async (job, done) => {
    const { data } = job.attrs;
    await imageOptimizer(data);
    done();
  },
};

module.exports = JobHandlers;
