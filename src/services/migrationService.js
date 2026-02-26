const fs = require("fs");
const csv = require("csv-parser");
const pool = require("../config/postgres");
const connectMongo = require("../config/mongodb");

async function migrateData(csvPath) {
  const patientsMap = new Map();
  const doctorsMap = new Map();
  const insurancesMap = new Map();
  const treatmentsMap = new Map();
  const appointments = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        patientsMap.set(row.patient_email, {
          name: row.patient_name,
          email: row.patient_email.toLowerCase(),
          phone: row.patient_phone,
          address: row.patient_address
        });

        doctorsMap.set(row.doctor_email, {
          name: row.doctor_name,
          email: row.doctor_email.toLowerCase(),
          specialty: row.specialty
        });

        insurancesMap.set(row.insurance_provider, {
          name: row.insurance_provider,
          coverage: parseInt(row.coverage_percentage)
        });

        treatmentsMap.set(row.treatment_code, {
          code: row.treatment_code,
          description: row.treatment_description,
          cost: parseFloat(row.treatment_cost)
        });

        appointments.push(row);
      })
      .on("end", async () => {
        try {
          // Insert patients
          for (let patient of patientsMap.values()) {
            await pool.query(
              `INSERT INTO patients(name,email,phone,address)
               VALUES($1,$2,$3,$4)
               ON CONFLICT (email) DO NOTHING`,
              [patient.name, patient.email, patient.phone, patient.address]
            );
          }

          // Insert doctors
          for (let doctor of doctorsMap.values()) {
            await pool.query(
              `INSERT INTO doctors(name,email,specialty)
               VALUES($1,$2,$3)
               ON CONFLICT (email) DO NOTHING`,
              [doctor.name, doctor.email, doctor.specialty]
            );
          }

          // Insert insurances
          for (let insurance of insurancesMap.values()) {
            await pool.query(
              `INSERT INTO insurances(name,coverage_percentage)
               VALUES($1,$2)
               ON CONFLICT (name) DO NOTHING`,
              [insurance.name, insurance.coverage]
            );
          }

          // Insert treatments
          for (let treatment of treatmentsMap.values()) {
            await pool.query(
              `INSERT INTO treatments(code,description,cost)
               VALUES($1,$2,$3)
               ON CONFLICT (code) DO NOTHING`,
              [treatment.code, treatment.description, treatment.cost]
            );
          }

          resolve({
            patients: patientsMap.size,
            doctors: doctorsMap.size,
            insurances: insurancesMap.size,
            treatments: treatmentsMap.size,
            appointments: appointments.length
          });

        } catch (error) {
          reject(error);
        }
      });
  });
}

module.exports = { migrateData };