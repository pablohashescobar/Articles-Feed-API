const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const checkObjectId = require("../../middleware/checkObjectId");
const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const sendMailer = require("../../config/mailer");
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

      const current_time = new Date();
      const otp_expiry = current_time.setMinutes(
        current_time.getMinutes() + 30
      );
      const otp = Math.floor(Math.random() * 1000000);

      let user = new User({
        firstname,
        lastname,
        email,
        phone,
        date_of_birth,
        article_preferences,
        password,
        otp: otp,
        is_verified: false,
        otp_expiry: otp_expiry,
      });

      //Encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      //Send OTP to user's email
      const mailOptions = {
        from: "devinfoster1210@gmail.com",
        to: email,
        subject: "Verify your account",
        text: `Your OTP is ${otp}`,
      };

      //Send mail
      await sendMailer(mailOptions);

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

//@route POST api/users/verify
//@desc Verify a User
//@acess Private
router.post(
  "/verify-otp",
  [auth, [check("otp", "Please Enter a valid OTP").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    const { otp } = req.body;
    try {
      //See if the user exists
      const user = await User.findById(req.user.id);

      if (user) {
        if (user.otp === parseInt(otp)) {
          if (user.otp_expiry > Date.now()) {
            user.is_verified = true;
            user.otp = null;
            await user.save();
            return res.json({
              is_verified: true,
            });
          } else {
            return res
              .status(400)
              .json({ errors: [{ msg: "OTP has expired" }] });
          }
        } else {
          return res.status(400).json({
            errors: [{ msg: "OTP does not match" }],
          });
        }
      } else {
        return res.status(400).json({
          errors: [{ msg: "User does not exist" }],
        });
      }
      //Catching Error
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get("/resend-otp", [auth], async (req, res) => {
  try {
    //See if the user exists
    const user = await User.findById(req.user.id);
    const current_time = new Date();
    const otp_expiry = current_time.setMinutes(current_time.getMinutes() + 30);
    const otp = Math.floor(Math.random() * 1000000);

    user.otp = otp;
    user.otp_expiry = otp_expiry;
    await user.save();
    //Send OTP to user's email
    const mailOptions = {
      from: "devinfoster1210@gmail.com",
      to: user.email,
      subject: "Verify your account",
      text: `Your OTP is ${otp}`,
    };

    //Send mail
    await sendMailer(mailOptions);

    return res.json({
      message: "OTP sent to your email",
    });

    //Catching Error
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// @route    PUT api/users/follow/:id
// @desc     Follow a user
// @access   Private
router.put("/follow/:id", [auth, checkObjectId], async (req, res) => {
  try {
    const followingUser = await User.findById(req.user.id);
    const followedUser = await User.findById(req.params.id);

    // Check if user is not the same user that sent the request
    if (req.params.id === req.user.id) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Can't follow yourself!" }] });
    }

    // Check and remove following user from Req User's list if already followed
    if (
      followingUser.following.some(
        (iterator) => iterator.user.toString() === req.params.id
      )
    ) {
      followingUser.following = followingUser.following.filter(
        ({ user }) => user.toString() !== req.params.id
      );

      await followingUser.save();

      // Remove follower from Param User's list if already following
      followedUser.followers = followedUser.followers.filter(
        ({ user }) => user.toString() !== req.user.id
      );

      await followedUser.save();

      return res.json(followingUser);
    }

    // Else Update following and followed lists
    if (followingUser && followedUser) {
      //Save the new like
      followingUser.following.unshift({ user: req.params.id });
      followedUser.followers.unshift({ user: req.user.id });

      await followingUser.save();
      await followedUser.save();

      return res.json(followingUser);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/users/otp/generate
// @desc     Generate OTP
// @access   Private
router.get("/otp/generate", [auth], async (req, res) => {
  try {
    //See if the user exists
    user = await User.findById(req.user.id);
    const current_time = new Date();
    const otp_expiry = current_time.setMinutes(current_time.getMinutes() + 30);
    const otp = Math.floor(Math.random() * 1000000);

    user.otp = otp;
    user.otp_expiry = otp_expiry;
    await user.save();
    //Send OTP to user's email
    const mailOptions = {
      from: "devinfoster1210@gmail.com",
      to: user.email,
      subject: "Verify your account",
      text: `Your OTP is ${otp}`,
    };

    //Send mail
    await sendMailer(mailOptions);

    return res.json({
      message: "OTP sent to your email",
    });

    //Catching Error
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
