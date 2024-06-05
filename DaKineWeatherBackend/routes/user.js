const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Endpoint to fetch user score
router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user) {
      res.json({ userScore: user.userScore });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user score:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
