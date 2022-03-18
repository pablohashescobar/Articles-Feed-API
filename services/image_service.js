const axios = require("axios");

const optimizeImage = async (data) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        token: process.env.API_TOKEN,
      },
    };

    const response = await axios.post(
      process.env.IMAGE_OPTIMIZER_URL,
      data,
      config
    );
    console.log(response.data);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = optimizeImage;
