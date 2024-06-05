const express = require("express");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/guest-login", async (req, res) => {
  const ipAddress =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    // Check if a user with this IP address already exists
    let user = await User.findOne({ ipAddress });
    let returning = !!user;
    if (!user) {
      const guestId = uuidv4();
      user = new User({ guestId, ipAddress, userScore: 1 }); // Default score for guests
      await user.save();
      returning = false;
    }

    // Generate JWT token
    const userToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ userToken, userId: user._id, returning });
  } catch (error) {
    console.error("Guest login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/google-login", async (req, res) => {
  const userInfo = req.body;

  try {
    const { sub: googleId, email } = userInfo;

    // Check if a user with this Google ID or email already exists
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    const returning = !!user;
    if (!user) {
      user = new User({ googleId, email, userScore: 10 }); // Higher default score for Google sign-ins
      await user.save();
    }

    // Generate JWT token
    const userToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ userToken, userId: user._id, returning });
  } catch (error) {
    console.error("Google login error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
