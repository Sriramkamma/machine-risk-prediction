require("dotenv").config();

const express = require("express");
const cors = require("cors");

const fieldRoutes = require("./routes/fieldRoutes");
const machineRoutes = require("./routes/machineRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/fields", fieldRoutes);
app.use("/api/machines", machineRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Machine Risk Prediction API is running successfully",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});