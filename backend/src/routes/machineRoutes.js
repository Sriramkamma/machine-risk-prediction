const express = require("express");
const supabase = require("../config/supabase");
const router = express.Router();


// all machines
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("machines")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Get machines error:", error);

    return res.status(500).json({
      error: "Failed to fetch machines",
    });
  }

  res.json(data);
});


// creating machine

router.post("/", async (req, res) => {
  const { data: machineData } = req.body;

  if (!machineData) {
    return res.status(400).json({
      error: "Machine data is required",
    });
  }

  const { data, error } = await supabase
    .from("machines")
    .insert([
      {
        data: machineData,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Create machine error:", error);

    return res.status(500).json({
      error: "Failed to create machine",
    });
  }

  res.status(201).json(data);
});


// update

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { data: machineData } = req.body;

  if (!machineData) {
    return res.status(400).json({
      error: "Machine data is required",
    });
  }

  const { data, error } = await supabase
    .from("machines")
    .update({
      data: machineData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update machine error:", error);

    return res.status(500).json({
      error: "Failed to update machine",
    });
  }

  res.json(data);
});


// delete

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("machines")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete machine error:", error);

    return res.status(500).json({
      error: "Failed to delete machine",
    });
  }

  res.json({
    message: "Machine deleted successfully",
  });
});


// PREDICT MACHINE RISK

router.post("/:id/predict", async (req, res) => {
  const { id } = req.params;

  try {
    // 1. machin from database
    const { data: machine, error: machineError } = await supabase
      .from("machines")
      .select("*")
      .eq("id", id)
      .single();

    if (machineError) {
      console.error("Machine fetch error:", machineError);

      return res.status(404).json({
        error: "Machine not found",
      });
    }

    // 2. machin data(get)
    const machineData = machine.data;
    const temperature = machineData["Temperature"];
    const pressure = machineData["Pressure"];
    const vibration = machineData["Vibration"];

    // 3. validating
    if (
      temperature === undefined ||
      pressure === undefined ||
      vibration === undefined
    ) {
      return res.status(400).json({
        error:
          "Machine must contain Temperature, Pressure, and Vibration",
      });
    }

    // 4. conecting host
    const mlServiceUrl =
      process.env.ML_SERVICE_URL || "http://localhost:8000";

    const mlResponse = await fetch(`${mlServiceUrl}/predict`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        Temperature: Number(temperature),
        Pressure: Number(pressure),
        Vibration: vibration,
      }),
    });

    // 5. python response
    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();

      console.error("ML service error:", errorText);

      return res.status(502).json({
        error: "ML prediction service failed",
      });
    }

    // 6. prediction reading
    const prediction = await mlResponse.json();

    // 7. result to front
    res.json({
      machineId: machine.id,
      machineName: machineData["Machine Name"] || "Unnamed Machine",
      temperature,
      pressure,
      vibration,
      risk: prediction.risk,
    });

  } catch (error) {
    console.error("Prediction error:", error);

    res.status(500).json({
      error: "Failed to predict machine risk",
    });
  }
});


module.exports = router;