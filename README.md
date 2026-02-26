# SaludPlus - Hybrid Medical Appointment System

## Overview

SaludPlus is a backend medical appointment management system built using a hybrid database architecture.  

The system demonstrates relational data modeling, data migration from CSV, analytical queries, and document-based historical storage.

It combines:

- PostgreSQL for transactional and relational data
- MongoDB for aggregated patient medical history
- Node.js with Express for the REST API layer

This project was developed as a practical simulation for technical evaluation.

---

## Architecture

### Relational Layer – PostgreSQL

PostgreSQL is used to manage structured and transactional data with referential integrity.

Tables:

- patients
- doctors
- insurances
- treatments
- appointments

Features:

- Foreign keys
- Normalized schema (3NF)
- Data integrity constraints
- Analytical SQL queries using JOIN and GROUP BY

---

### Document Layer – MongoDB

MongoDB stores aggregated patient medical history as a single document per patient.

Each document contains:

- Patient basic information
- Embedded array of historical appointments
- Doctor, treatment, insurance, and payment details

This improves performance for read-heavy historical queries.

---

## Technologies Used

- Node.js
- Express
- PostgreSQL
- MongoDB
- CSV data migration
- Git for version control
- Linux environment (Ubuntu 24.04 LTS)

---
## Project Structure
src/
config/
postgres.js
mongodb.js
routes/
simulacro.js
analytics.js
patients.js
services/
migrationService.js

database/
schema.sql

data/
simulation_saludplus_data.csv

---

## Installation

### 1. Clone the repository
git clone https://github.com/stivenmoscoso/Saludplus.git
cd Saludplus

### 2. Install dependencies
npm install

### 3. Configure environment variables
Create a .env file in the root directory:
PORT=3000

DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=saludplus
DB_PORT=5432

MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=saludplus


---

## Database Setup

### Create PostgreSQL schema
psql -U postgres -d saludplus -f database/schema.sql

---

## Running the Application

Start the server:
node src/server.js:
http://localhost:3000


---

## Data Migration

To load data from CSV into PostgreSQL and generate MongoDB history:

POST
http://localhost:3000/api/simulacro/migrate

This process:

1. Reads CSV file
2. Inserts normalized data into PostgreSQL
3. Creates patient historical documents in MongoDB

---

## Available Endpoints

### Migration

POST /api/simulacro/migrate

---

### Analytics (PostgreSQL)

GET /api/analytics/doctor-income  
GET /api/analytics/insurance-income  
GET /api/analytics/top-treatments  

---

### Patient History (MongoDB)

GET /api/patients/:id/history

Example:
GET /api/patients/1/history


---

## How to Test the System

1. Start the server
2. Run the migration endpoint
3. Verify relational data in PostgreSQL
4. Query analytics endpoints
5. Retrieve patient history from MongoDB

---

## Design Decisions

- PostgreSQL ensures relational consistency and transaction safety.
- MongoDB optimizes aggregated historical queries.
- The hybrid architecture separates transactional and analytical responsibilities.

---

## Author

Stiven Moscoso

---
