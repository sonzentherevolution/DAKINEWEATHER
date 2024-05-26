const express = require("express");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/guest-login", async (req, res) => {
  const ipAddress =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const guestId = uuidv4();

  const user = new User({ guestId, ipAddress });
  await user.save();

  res.json({ guestId });
});

router.post("/google-login", async (req, res) => {
  const userInfo = req.body;

  console.log("Received user info:", userInfo);

  try {
    const { sub: googleId, email } = userInfo;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ googleId, email });
      await user.save();
    }

    const userToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ userToken });
  } catch (error) {
    console.error("Google login error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
