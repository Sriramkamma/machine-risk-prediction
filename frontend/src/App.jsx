import { useEffect, useState } from "react";

// Backend API URL
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [fields, setFields] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("text");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState("");

  // Stores prediction results by machine ID
  const [predictions, setPredictions] = useState({});

  // machin state
  const [machineData, setMachineData] = useState({});
  const [machines, setMachines] = useState([]);

  // Stores the ID of the machine currently being edited
  const [editingMachineId, setEditingMachineId] = useState(null);

  // data loding

  useEffect(() => {
    fetchFields();
    fetchMachines();
  }, []);

  // fetching

  const fetchFields = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/fields`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch fields");
      }

      const data = await response.json();

      setFields(data);
    } catch (error) {
      console.error("Failed to fetch fields:", error);
    }
  };

  // fetching machines

  const fetchMachines = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/machines`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch machines");
      }

      const data = await response.json();

      setMachines(data);
    } catch (error) {
      console.error("Failed to fetch machines:", error);
    }
  };

  // feild adding
  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanedName = name.trim();

    if (!cleanedName) {
      alert("Please enter a field name.");
      return;
    }

    const fieldData = {
      name: cleanedName,
      type,
      required,
      options:
        type === "dropdown"
          ? options
              .split(",")
              .map((option) => option.trim())
              .filter(Boolean)
          : null,
    };

    try {
      const response = await fetch(
        `${API_URL}/api/fields`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fieldData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create field");
      }

      // Clear field configuration form
      setName("");
      setType("text");
      setRequired(false);
      setOptions("");

      // Refresh fields
      fetchFields();
    } catch (error) {
      console.error("Failed to create field:", error);
    }
  };

  // delet

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this field?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/fields/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete field");
      }

      fetchFields();
    } catch (error) {
      console.error("Failed to delete field:", error);
    }
  };

  const handleMachineChange = (field, value) => {
    const fieldName = field.name.trim();

    let convertedValue = value;

    // Convert number fields from string to number
    if (field.type === "number" && value !== "") {
      convertedValue = Number(value);
    }

    setMachineData((previousData) => ({
      ...previousData,
      [fieldName]: convertedValue,
    }));
  };

  // create and update
  const handleMachineSubmit = async (event) => {
    event.preventDefault();

    try {
      let response;

      // update existing machin

      if (editingMachineId) {
        response = await fetch(
          `${API_URL}/api/machines/${editingMachineId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: machineData,
            }),
          }
        );
      }

      // create new machine

      else {
        response = await fetch(
          `${API_URL}/api/machines`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: machineData,
            }),
          }
        );
      }

      if (!response.ok) {
        throw new Error(
          editingMachineId
            ? "Failed to update machine"
            : "Failed to create machine"
        );
      }

      // Clear form
      setMachineData({});

      // Exit edit mode
      setEditingMachineId(null);

      // Refresh machines
      fetchMachines();
    } catch (error) {
      console.error("Machine operation failed:", error);
    }
  };

  // edit M

  const handleEditMachine = (machine) => {
    setMachineData(machine.data);

    setEditingMachineId(machine.id);

    // Scroll to machine form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // cancel em

  const handleCancelEdit = () => {
    setMachineData({});
    setEditingMachineId(null);
  };

  // delete m

  const handleDeleteMachine = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this machine?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/machines/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete machine");
      }

      // If the deleted machine was being edited,
      // exit edit mode.
      if (editingMachineId === id) {
        setMachineData({});
        setEditingMachineId(null);
      }

      // Remove its prediction from React state
      setPredictions((previousPredictions) => {
        const updatedPredictions = {
          ...previousPredictions,
        };

        delete updatedPredictions[id];

        return updatedPredictions;
      });

      // Refresh machines
      fetchMachines();
    } catch (error) {
      console.error("Failed to delete machine:", error);
    }
  };

  // predicr risk

  const handlePredictRisk = async (machineId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/machines/${machineId}/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to predict machine risk");
      }

      const result = await response.json();

      console.log("Prediction result:", result);

      setPredictions((previousPredictions) => ({
        ...previousPredictions,
        [machineId]: result.risk,
      }));
    } catch (error) {
      console.error("Prediction failed:", error);

      alert("Failed to predict machine risk.");
    }
  };

  // UI
  return (
    <div>
      <h1>Machine Risk Prediction System</h1>

      <h2>Field Configuration</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Field Name</label>
          <br />

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Enter field name"
            required
          />
        </div>

        <br />

        <div>
          <label>Field Type</label>
          <br />

          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value)
            }
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </div>

        <br />

        <div>
          <label>
            <input
              type="checkbox"
              checked={required}
              onChange={(event) =>
                setRequired(event.target.checked)
              }
            />

            {" "}Required
          </label>
        </div>

        <br />

        {type === "dropdown" && (
          <div>
            <label>Dropdown Options</label>
            <br />

            <input
              type="text"
              value={options}
              onChange={(event) =>
                setOptions(event.target.value)
              }
              placeholder="Low, Medium, High"
            />
          </div>
        )}

        <br />

        <button type="submit">
          Add Field
        </button>
      </form>

      <hr />

      <h2>Configured Fields</h2>

      {fields.map((field) => (
        <div key={field.id}>
          <strong>{field.name}</strong> - {field.type}

          {field.required && " - Required"}

          {field.type === "dropdown" &&
            field.options && (
              <span>
                {" - "}
                {field.options.join(", ")}
              </span>
            )}

          {" "}

          <button
            onClick={() => handleDelete(field.id)}
          >
            Delete
          </button>
        </div>
      ))}

      <hr />

      <h2>Machine Records</h2>

      {editingMachineId && (
        <p>
          <strong>Editing Machine</strong>
        </p>
      )}

      <form onSubmit={handleMachineSubmit}>
        {fields.map((field) => {
          const fieldName = field.name.trim();

          return (
            <div key={field.id}>
              <label>
                {fieldName}

                {field.required && " *"}
              </label>

              <br />

              {/* TEXT */}

              {field.type === "text" && (
                <input
                  type="text"
                  value={machineData[fieldName] || ""}
                  onChange={(event) =>
                    handleMachineChange(
                      field,
                      event.target.value
                    )
                  }
                  required={field.required}
                />
              )}

              {/* NUMBER */}

              {field.type === "number" && (
                <input
                  type="number"
                  value={machineData[fieldName] ?? ""}
                  onChange={(event) =>
                    handleMachineChange(
                      field,
                      event.target.value
                    )
                  }
                  required={field.required}
                />
              )}

              {/* DROPDOWN */}

              {field.type === "dropdown" && (
                <select
                  value={machineData[fieldName] || ""}
                  onChange={(event) =>
                    handleMachineChange(
                      field,
                      event.target.value
                    )
                  }
                  required={field.required}
                >
                  <option value="">
                    Select...
                  </option>

                  {field.options?.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              )}

              <br />
              <br />
            </div>
          );
        })}

        <button type="submit">
          {editingMachineId
            ? "Update Machine"
            : "Save Machine"}
        </button>

        {editingMachineId && (
          <>
            {" "}

            <button
              type="button"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </>
        )}
      </form>

      <hr />

      <h2>Saved Machines</h2>

      {machines.map((machine) => (
        <div key={machine.id}>
          <strong>
            {machine.data["Machine Name"] ||
              "Unnamed Machine"}
          </strong>

          <pre>
            {JSON.stringify(
              machine.data,
              null,
              2
            )}
          </pre>

          {/* PREDICT */}

          <button
            onClick={() =>
              handlePredictRisk(machine.id)
            }
          >
            Predict Risk
          </button>

          {" "}

          {/* EDIT */}

          <button
            onClick={() =>
              handleEditMachine(machine)
            }
          >
            Edit
          </button>

          {" "}

          {/* DELETE */}

          <button
            onClick={() =>
              handleDeleteMachine(machine.id)
            }
          >
            Delete
          </button>

          {/* RISK RESULT */}

          {predictions[machine.id] && (
            <p>
              <strong>
                Risk: {predictions[machine.id]}
              </strong>
            </p>
          )}

          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;