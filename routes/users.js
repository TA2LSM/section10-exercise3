const { User, validate } = require("../models/user");
const _ = require("lodash");

const mongoose = require("mongoose");

const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

// Get All Users
router.get("/", async (req, res) => {
  const users = await User.find().sort("name");
  res.status(200).send(users);
});

// Create User
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered!");

  // şifre hash'leme kısmı
  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);
  await user.save();

  const token = jwt.sign({ _id: user._id }, config.get("jwtPrivateKey"));
  res.header("x-auth-token", token).send(_.pick(user, ["_id", "name", "email"]));
  //Aşağıdaki şekilde de yazılabilir. "Authorization" kısmı altına token gelecektir.
  //res.header("Authorization", token).send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
