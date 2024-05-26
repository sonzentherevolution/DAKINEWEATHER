const express = require("express");
const { exec } = require("child_process");

const router = express.Router();

router.post("/add-mock-votes", (req, res) => {
  const { location, condition } = req.body;

  exec(
    `node utils/createMockData.js vote "${location}" "${condition}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        return res.status(500).json({ error: "Error adding mock votes" });
      }
      if (stderr) {
        console.error(`Script stderr: ${stderr}`);
        return res.status(500).json({ error: "Error adding mock votes" });
      }
      console.log(`Script stdout: ${stdout}`);
      res.json({ success: true, message: "Mock votes added successfully" });
    }
  );
});

module.exports = router;
