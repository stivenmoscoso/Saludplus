
-- SALUDPLUS - PostgreSQL Schema
-- 3NF Normalized Structure (5 Tables)



-- DROP TABLES

DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS treatments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS insurances CASCADE;


-- TABLE: patients

CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT
);


-- TABLE: doctors

CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    specialty VARCHAR(100) NOT NULL
);


-- TABLE: insurances

CREATE TABLE insurances (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    coverage_percentage INTEGER NOT NULL 
        CHECK (coverage_percentage >= 0 AND coverage_percentage <= 100)
);

-- =========================
-- TABLE: treatments
-- =========================
CREATE TABLE treatments (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    cost NUMERIC(12,2) NOT NULL
);


-- TABLE: appointments

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    appointment_id VARCHAR(50) UNIQUE NOT NULL,
    appointment_date DATE NOT NULL,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    insurance_id INTEGER,
    treatment_id INTEGER NOT NULL,
    amount_paid NUMERIC(12,2) NOT NULL,

    CONSTRAINT fk_patient
        FOREIGN KEY(patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_doctor
        FOREIGN KEY(doctor_id)
        REFERENCES doctors(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_insurance
        FOREIGN KEY(insurance_id)
        REFERENCES insurances(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_treatment
        FOREIGN KEY(treatment_id)
        REFERENCES treatments(id)
        ON DELETE CASCADE
);


-- INDEXES 
CREATE INDEX idx_patient_email ON patients(email);
CREATE INDEX idx_doctor_specialty ON doctors(specialty);
CREATE INDEX idx_treatment_code ON treatments(code);
CREATE INDEX idx_appointment_date ON appointments(appointment_date);