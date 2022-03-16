require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const sentry = require("@sentry/node");
const tracing = require("@sentry/tracing");
const cors = require("cors");
const path = require("path");
const chalk = require("chalk");
//Initialize express
const app = express();
//connect to DB
connectDB();

//Init middleware
app.use(express.json({ extended: false }));

sentry.init({
  dsn: "https://c7a9d680289041cb9bf83d253d437af8@o1169530.ingest.sentry.io/6262439",
  integrations: [
    // enable HTTP calls tracing
    new sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(sentry.Handlers.tracingHandler());

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
app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
  });

//Defining Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/articles", require("./routes/api/articles"));

app.use(sentry.Handlers.errorHandler());
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
