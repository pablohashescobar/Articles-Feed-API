const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Article = require("../../models/Article");
//middleware
const auth = require("../../middleware/auth");

//@route POST api/users
//@desc Register a new User
//@acess Public
router.post(
  "/",
  [
    check("firstname", "Please Enter a First Name").not().isEmpty(),
    check("lastname", "Please Enter a Last Name").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("phone", "Please Enter a valid phone number").isNumeric(),
    check("date_of_birth", "Please Enter a valid date of birth")
      .not()
      .isEmpty(),
    check("article_preferences", "Please Enter one or two preferences")
      .not()
      .isEmpty(),
    check("password", "Password must be atleast 6 characters long").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstname,
      lastname,
      email,
      phone,
      date_of_birth,
      article_preferences,
      password,
    } = req.body;
    try {
      //See if the user exists

      let userEmail = await User.findOne({ email });

      if (userEmail) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User with this email already exists" }] });
      }

      let userPhone = await User.findOne({ phone });

      if (userPhone) {
        return res.status(400).json({
          errors: [{ msg: "User with this phone number already exists" }],
        });
      }

      let user = new User({
        firstname,
        lastname,
        email,
        phone,
        date_of_birth,
        article_preferences,
        password,
      });

      //Encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      //Return JWT
      const payload = {
        user: {
          id: user.id,
        },
      };
      const jwtsecret = process.env.JWT_SECRET;
      jwt.sign(payload, jwtsecret, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
      //Catching Error
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//@route POST api/users/edit
//@desc Edit a User
//@acess Private
router.put(
  "/edit",
  [
    auth,
    [
      check("firstname", "Please Enter a First Name").not().isEmpty(),
      check("lastname", "Please Enter a Last Name").not().isEmpty(),
      check("email", "Please include a valid email").isEmail(),
      check("phone", "Please Enter a valid phone number").isNumeric(),
      check("date_of_birth", "Please Enter a valid date of birth")
        .not()
        .isEmpty(),
      check("article_preferences", "Please Enter one or two preferences")
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstname,
      lastname,
      email,
      phone,
      date_of_birth,
      article_preferences,
      password,
    } = req.body;
    try {
      //See if the user exists

      if (password && password.length < 6) {
        return res.status(400).json({
          errors: [{ msg: "Password must be atleast 6 characters long" }],
        });
      }

      let user = await User.findById(req.user.id);

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User does not exist" }] });
      }

      user.firstname = firstname;
      user.lastname = lastname;
      user.email = email;
      user.phone = phone;
      user.date_of_birth = date_of_birth;
      user.article_preferences = article_preferences;

      if (password && password.length) {
        //Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      await user.save();

      return res.json({
        firstname,
        lastname,
        email,
        phone,
        date_of_birth,
        article_preferences,
      });
      //Catching Error
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;