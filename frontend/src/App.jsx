import React, { useState } from "react";
import axios from "axios";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    resume_url: "",
  });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); 
    try {
      // Points exactly to your backend Port 5000
      const res = await axios.post("http://localhost:5000/api/apply", formData);
      setMessage("✅ Success: " + res.data.message);
      setFormData({ name: "", email: "", resume_url: "" }); // Clear form
    } catch (err) {
      console.error(err);
      setMessage("❌ Error: Could not connect to the backend.");
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", marginTop: "50px" }}>
      <h1>🚀 XcelCrowd</h1>
      <form onSubmit={handleSubmit} style={{ display: "inline-block", textAlign: "left" }}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{ padding: "8px", width: "300px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{ padding: "8px", width: "300px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="url"
            placeholder="Resume URL (e.g., https://google.com)"
            value={formData.resume_url}
            onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
            style={{ padding: "8px", width: "300px" }}
          />
        </div>
        <button type="submit" style={{ padding: "10px 20px", background: "#646cff", color: "white", border: "none", cursor: "pointer", width: "100%" }}>
          Submit Application
        </button>
      </form>
      {message && <p style={{ marginTop: "20px", fontWeight: "bold" }}>{message}</p>}
    </div>
  );
}

export default App;