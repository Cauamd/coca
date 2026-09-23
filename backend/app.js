const express = require("express");
const cors = require("cors");
require("dotenv").config();

const apontamentosRoutes = require("./routes/apontamentos.routes");

const app = express();

// --- CORS ---
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
// --- fim CORS ---

app.use(express.json());

app.use("/apontamentos", apontamentosRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

const classificationRoutes = require("./routes/classification.routes");
app.use("/classificacao", classificationRoutes);

const dashboardRoutes = require("./routes/dashboard.routes");
app.use("/dashboard", dashboardRoutes);

module.exports = app;