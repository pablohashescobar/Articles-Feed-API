require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
//Initialize express
const app = express();

//connect to DB
connectDB();

//Init middleware
app.use(express.json({ extended: false }));
app.use(cors());

app.get("/status", (req, res) => res.send("API up and Running"));

//Defining Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/articles", require("./routes/api/articles"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
