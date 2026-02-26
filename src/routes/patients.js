const express = require("express");
const router = express.Router();
const connectMongo = require("../config/mongodb");

router.get("/:id/history", async (req, res) => {
  const mongoDb = await connectMongo();
  const collection = mongoDb.collection("patient_history");

  const patientId = parseInt(req.params.id);

  const patient = await collection.findOne({ patient_id: patientId });

  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  res.json(patient);
});

module.exports = router;