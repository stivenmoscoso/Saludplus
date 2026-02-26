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
          // Insert appointments with foreign keys
for (let row of appointments) {

  const patientResult = await pool.query(
    "SELECT id FROM patients WHERE email = $1",
    [row.patient_email.toLowerCase()]
  );

  const doctorResult = await pool.query(
    "SELECT id FROM doctors WHERE email = $1",
    [row.doctor_email.toLowerCase()]
  );

  const insuranceResult = await pool.query(
    "SELECT id FROM insurances WHERE name = $1",
    [row.insurance_provider]
  );

  const treatmentResult = await pool.query(
    "SELECT id FROM treatments WHERE code = $1",
    [row.treatment_code]
  );

  if (
    patientResult.rows.length &&
    doctorResult.rows.length &&
    insuranceResult.rows.length &&
    treatmentResult.rows.length
  ) {
    await pool.query(
      `INSERT INTO appointments
       (appointment_id, appointment_date, patient_id, doctor_id, insurance_id, treatment_id, amount_paid)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (appointment_id) DO NOTHING`,
      [
        row.appointment_id,
        row.appointment_date,
        patientResult.rows[0].id,
        doctorResult.rows[0].id,
        insuranceResult.rows[0].id,
        treatmentResult.rows[0].id,
        parseFloat(row.amount_paid)
      ]
    );
  }
}

//MONGO DATOS HISTORICOS


const mongoDb = await connectMongo();
const historyCollection = mongoDb.collection("patient_history");

// Clear previous documents (for testing)
await historyCollection.deleteMany({});

// Get complete relational data
const fullData = await pool.query(`
  SELECT 
    p.id as patient_id,
    p.name as patient_name,
    p.email as patient_email,
    a.appointment_date,
    d.name as doctor_name,
    d.specialty,
    t.description as treatment_description,
    t.cost,
    i.name as insurance_name,
    a.amount_paid
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  JOIN doctors d ON a.doctor_id = d.id
  JOIN treatments t ON a.treatment_id = t.id
  JOIN insurances i ON a.insurance_id = i.id
  ORDER BY p.id
`);

const patientMap = new Map();

for (let row of fullData.rows) {

  if (!patientMap.has(row.patient_id)) {
    patientMap.set(row.patient_id, {
      patient_id: row.patient_id,
      name: row.patient_name,
      email: row.patient_email,
      history: []
    });
  }

  patientMap.get(row.patient_id).history.push({
    date: row.appointment_date,
    doctor: row.doctor_name,
    specialty: row.specialty,
    treatment: row.treatment_description,
    cost: row.cost,
    insurance: row.insurance_name,
    amount_paid: row.amount_paid
  });
}

// Insert documents into Mongo
for (let patient of patientMap.values()) {
  await historyCollection.insertOne(patient);
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