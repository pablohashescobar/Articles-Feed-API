require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const initAgenda = require("./jobs/ajenda");
const cors = require("cors");
const chalk = require("chalk");

//connect to DB
connectDB();
//Initialize express
const app = express();

//Init middleware
app.use(express.json({ extended: false }));
app.use(cors());

//Loggers
const getActualRequestDurationInMilliseconds = (start) => {
  const NS_PER_SEC = 1e9; //  convert to nanoseconds
  const NS_TO_MS = 1e6; // convert to milliseconds
  const diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

let routeLogger = (req, res, next) => {
  //middleware function
  let current_datetime = new Date();
  let formatted_date =
    current_datetime.getFullYear() +
    "-" +
    (current_datetime.getMonth() + 1) +
    "-" +
    current_datetime.getDate() +
    " " +
    current_datetime.getHours() +
    ":" +
    current_datetime.getMinutes() +
    ":" +
    current_datetime.getSeconds();

  let method = req.method;
  let url = req.url;
  let status = res.statusCode;
  const start = process.hrtime();
  const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
  let log = `[${chalk.blue(
    formatted_date
  )}] ${method}${url} ${status} ${chalk.red(
    durationInMilliseconds.toLocaleString() + "ms"
  )}`;
  console.log(log);
  next();
};
app.use(routeLogger);

app.get("/", (req, res) => res.send("Welcome to Articles Feed API"));
app.get("/status/", (req, res) => res.send("API up and Running"));

//Defining Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/articles", require("./routes/api/articles"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
