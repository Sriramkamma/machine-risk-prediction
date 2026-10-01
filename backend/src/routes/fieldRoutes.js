const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

// GET all field configurations
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("field_configurations")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return res.status(500).json({
      error: "Failed to fetch field configurations",
    });
  }

  res.json(data);
});

// POST - create a new field configuration
router.post("/", async (req, res) => {
  try {
    const { name, type, required, options } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        error: "Field name and type are required",
      });
    }

    const { data, error } = await supabase
      .from("field_configurations")
      .insert([
        {
          name,
          type,
          required: required ?? false,
          options: options ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to create field configuration",
    });
  }
});

// DELETE - delete a field configuration
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("field_configurations")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json({
      message: "Field deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete field",
    });
  }
});
module.exports = router;