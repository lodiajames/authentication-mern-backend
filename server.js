const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("./models/userSchema.js");

const SECRET_KEY = process.env.SECRET_KEY;
PORT = process.env.PORT;
MONGODB_URL = process.env.MONGODB_URL;
//  conn express
const app = express();
// connect to mgdb
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server running at ${PORT} & database connected to MONGODDB`);
    });
  })
  .catch((err) => {
    console.log("Oops can not connected to the server and the database", {
      message: err,
    });
  });
//mdw
app.use(bodyParser.json());
app.use(cors());
//Routes
// Routes for register
app.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error signing up" });
  }
});

app.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(201).json(users);
  } catch (error) {
    res.status(500).json({ error: "Unable to get Users" });
  }
});
// Routes for Login

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ error: "Invalid credentials" });
    }

    const isPasswordvalid = await bcrypt.compare(password, user.password);
    if (!isPasswordvalid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "1hr",
    });
    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: "Error loggin in" });
  }
});
