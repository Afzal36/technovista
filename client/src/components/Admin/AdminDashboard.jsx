import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminTechnicianRequests() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all technician requests
  useEffect(() => {
    fetch("http://localhost:5000/api/technicians")
      .then((res) => res.json())
      .then((data) => {
        setTechnicians(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Accept technician
  const handleAccept = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/technicians/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: true }),
      });
      if (res.ok) {
        setTechnicians((prev) =>
          prev.map((tech) =>
            tech._id === id ? { ...tech, status: true } : tech
          )
        );
      }
    } catch (err) {
      alert("Failed to accept request");
    }
  };

  // Decline technician
  const handleDecline = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/technicians/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTechnicians((prev) => prev.filter((tech) => tech._id !== id));
      }
    } catch (err) {
      alert("Failed to decline request");
    }
  };

  return (
    <div className="admin-tech-container">
      <h2 className="admin-tech-title">Technician Requests</h2>
      {loading ? (
        <div className="admin-tech-loading">Loading...</div>
      ) : technicians.length === 0 ? (
        <div className="admin-tech-empty">No technician requests found.</div>
      ) : (
        <table className="admin-tech-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Field</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Experience</th>
              <th>Status</th>
              <th>Aadhaar</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((tech) => (
              <tr key={tech._id}>
                <td>{tech.name}</td>
                <td>{tech.field}</td>
                <td>{tech.phno}</td>
                <td>{tech.mail}</td>
                <td>{tech.experience} yrs</td>
                <td>
                  {tech.status ? (
                    <span className="admin-tech-status accepted">Accepted</span>
                  ) : (
                    <span className="admin-tech-status pending">Pending</span>
                  )}
                </td>
                <td>
                  {tech.aadhaarImage ? (
                    <a
                      href={`data:image/jpeg;base64,${tech.aadhaarImage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  {!tech.status && (
                    <>
                      <button
                        className="admin-tech-btn accept"
                        onClick={() => handleAccept(tech._id)}
                      >
                        Accept
                      </button>
                      <button
                        className="admin-tech-btn decline"
                        onClick={() => handleDecline(tech._id)}
                      >
                        Decline
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminTechnicianRequests;