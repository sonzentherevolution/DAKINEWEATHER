const express = require("express");
const Vote = require("../models/Vote");
const Weather = require("../models/Weather");
const User = require("../models/User");

const router = express.Router();
const VOTE_THRESHOLD = 3;
const VOTE_CAP = 5; // Max number of votes per user per hour

// Middleware to enforce voting cap
const voteCapMiddleware = async (req, res, next) => {
  const { userId, location } = req.body;

  console.log("Vote cap middleware called with userId:", userId);

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  try {
    const recentVotes = await Vote.find({
      userId,
      location,
      timestamp: { $gte: oneHourAgo },
    });

    console.log("Recent votes count:", recentVotes.length);

    if (recentVotes.length >= VOTE_CAP) {
      return res
        .status(429)
        .json({ error: "Vote limit exceeded. Please try again later." });
    }

    next();
  } catch (error) {
    console.error("Error in vote cap middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

router.post("/vote", voteCapMiddleware, async (req, res) => {
  const { userId, location, condition } = req.body;

  console.log("Vote endpoint called with:", req.body);

  try {
    const vote = new Vote({
      userId,
      location,
      condition,
      timestamp: new Date(),
    });
    await vote.save();

    const voteCount = await Vote.countDocuments({ location, condition });

    console.log("Current vote count:", voteCount);

    if (voteCount >= VOTE_THRESHOLD) {
      const votes = await Vote.find({ location });
      const conditionCount = {};

      votes.forEach((vote) => {
        if (!conditionCount[vote.condition]) {
          conditionCount[vote.condition] = 0;
        }
        conditionCount[vote.condition] += 1;
      });

      const aggregatedCondition = Object.keys(conditionCount).reduce((a, b) =>
        conditionCount[a] > conditionCount[b] ? a : b
      );

      const weather = await Weather.findOneAndUpdate(
        { location },
        { condition: aggregatedCondition, rank: voteCount },
        { new: true, upsert: true }
      );

      res.json({
        success: true,
        message: "Condition aggregated",
        condition: aggregatedCondition,
        weather,
      });
    } else {
      res.json({ success: true, message: "Vote recorded", voteCount });
    }
  } catch (error) {
    console.error("Failed to record vote:", error);
    res.status(500).json({ error: "Failed to record vote" });
  }
});

module.exports = router;
