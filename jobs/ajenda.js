const Agenda = require("agenda");
const allDefinitions = require("./definitions");

const agenda = new Agenda({
  db: {
    address: process.env.MONGO_URI,
    collection: "agendaJobs",
    options: { useUnifiedTopology: true, useNewUrlParser: true },
  },
  maxConcurrency: 20,
});

agenda.start();

agenda.on("ready", () => console.log("Agenda connected..."));
agenda.on("error", () => console.log("Agenda error..."));

allDefinitions(agenda);

console.log({ jobs: agenda._definitions });

module.exports = agenda;
