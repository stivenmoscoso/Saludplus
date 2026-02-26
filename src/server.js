const express = require("express");
const pool = require("./config/postgres");
const connectMongo = require("./config/mongodb");
const simulacroRoutes = require("./routes/simulacro");
const app = express();
const analyticsRoutes = require("./routes/analytics");
app.use("/api/analytics", analyticsRoutes);

app.use(express.json());
app.use("/api/simulacro", simulacroRoutes);


app.get("/", async (req, res) => {
  try {
    const sqlResult = await pool.query("SELECT NOW()");
    const mongoDb = await connectMongo();
    const collections = await mongoDb.listCollections().toArray();

    res.json({
      ok: true,
      postgres: sqlResult.rows[0],
      mongoCollections: collections.length
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor corriendo en puerto 3000");
});