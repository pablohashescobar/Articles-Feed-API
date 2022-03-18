const JobHandlers = require("../handlers");

const imageDefinitions = (agenda) => {
    agenda.define(
        "optimize-image",
        { priority: "low", concurrency: 10 },
        JobHandlers.optimizeImage
    );
};

module.exports = imageDefinitions;