const mailDefinitions = require("./mails");
const imageDefinitions = require("./images");

const definitions = [mailDefinitions, imageDefinitions];

const allDefinitions = (agenda) => {
  console.log("Defining jobs...");
  definitions.forEach((definition) => definition(agenda));
};

module.exports = allDefinitions;
