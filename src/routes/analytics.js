const express = require("express");
const router = express.Router();
const pool = require("../config/postgres");

router.get("/doctor-income", async (req, res) => {
  const result = await pool.query(`
    SELECT d.name AS doctor,
           SUM(a.amount_paid) AS total_income
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    GROUP BY d.name
    ORDER BY total_income DESC
  `);

  res.json(result.rows);
});

router.get("/insurance-income", async (req, res) => {
  const result = await pool.query(`
    SELECT i.name AS insurance,
           SUM(a.amount_paid) AS total_income
    FROM appointments a
    JOIN insurances i ON a.insurance_id = i.id
    GROUP BY i.name
    ORDER BY total_income DESC
  `);

  res.json(result.rows);
});

router.get("/top-treatments", async (req, res) => {
  const result = await pool.query(`
    SELECT t.description AS treatment,
           COUNT(*) AS total_times
    FROM appointments a
    JOIN treatments t ON a.treatment_id = t.id
    GROUP BY t.description
    ORDER BY total_times DESC
  `);

  res.json(result.rows);
});

module.exports = router;