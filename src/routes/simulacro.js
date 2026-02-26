const express = require("express");
const router = express.Router();
const { migrateData } = require("../services/migrationService");

router.post("/migrate", async (req, res) => {
  try {
    const result = await migrateData("./data/simulation_saludplus_data.csv");
    res.json({ ok: true, result });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;