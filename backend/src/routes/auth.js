const express = require("express");
const authRouter = express.Router();
const {validateSignUpData} = require('../utils/validation');
const User = require("../models/user");
const bcrypt = require('bcrypt');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const { isAuthenticated } = require("../middlewares/auth");
const sanitizeUser = require("../utils/sanitizeUser");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // ❌ Ignore role completely even if sent
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      role: "user" // 👈 FORCED
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: sanitizeUser(savedUser)
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new Error("Enter valid email");
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // 🚫 Blocked user check
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by admin"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",   // REQUIRED
  secure: false,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: sanitizeUser(user)
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});


authRouter.post('/logout', async (req, res) => {
    // res.cookie("token", null, {
    //     expires : new Date(Date.now())
    // });
    res.clearCookie("token");
    res.send("Logged out successfully");
})

authRouter.get("/me", isAuthenticated, async (req, res) => {
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user)
  });
});


module.exports = authRouter;