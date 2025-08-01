import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalImage, setModalImage] = useState(null);

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
     const res = await fetch(`http://localhost:5000/api/admin/accept-technician/${id}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" }
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

  // Stats
  const pendingCount = technicians.filter(t => !t.status).length;
  const acceptedCount = technicians.filter(t => t.status).length;

  // Improved search: search by name, field, email, phone, experience
  const filteredTechnicians = technicians.filter(tech => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      tech.name.toLowerCase().includes(term) ||
      tech.field.toLowerCase().includes(term) ||
      tech.mail.toLowerCase().includes(term) ||
      tech.phno.toLowerCase().includes(term) ||
      String(tech.experience).includes(term);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && !tech.status) ||
      (statusFilter === "accepted" && tech.status);

    return matchesSearch && matchesStatus;
  });

  // Modal close
  const closeModal = () => setModalImage(null);

  return (
    <div className="admin-dashboard">
      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stats-card pending">
          <div className="stats-content">
            <div>
              <div className="stats-number">{pendingCount}</div>
              <div className="stats-label">Pending Requests</div>
            </div>
            <div className="stats-icon pending">
              <i className="fas fa-clock"></i>
            </div>
          </div>
        </div>
        <div className="stats-card accepted">
          <div className="stats-content">
            <div>
              <div className="stats-number">{acceptedCount}</div>
              <div className="stats-label">Accepted Requests</div>
            </div>
            <div className="stats-icon accepted">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
        <div className="stats-card total">
          <div className="stats-content">
            <div>
              <div className="stats-number">{technicians.length}</div>
              <div className="stats-label">Total Requests</div>
            </div>
            <div className="stats-icon total">
              <i className="fas fa-users"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, field, email, phone, or experience..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>
      </div>

      {/* Modal for Aadhaar Image */}
      {modalImage && (
        <div className="aadhaar-modal-overlay" onClick={closeModal}>
          <div className="aadhaar-modal-content" onClick={e => e.stopPropagation()}>
            <img src={modalImage} alt="Aadhaar Full" className="aadhaar-modal-img" />
            <button className="aadhaar-modal-close" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading technician requests...</p>
        </div>
      ) : filteredTechnicians.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-users empty-icon"></i>
          <h4>No technician requests found</h4>
          <p>Try adjusting your search criteria or check back later.</p>
        </div>
      ) : (
        <div className="technicians-grid">
          {filteredTechnicians.map((tech) => (
            <div key={tech._id} className={`technician-card ${tech.status ? "accepted" : "pending"}`}>
              <div
                className="technician-image"
                onClick={() => {
                  if (tech.aadhaarImage) {
                    setModalImage(
                      tech.aadhaarImage.startsWith("data:")
                        ? tech.aadhaarImage
                        : `data:image/jpeg;base64,${tech.aadhaarImage}`
                    );
                  }
                }}
                style={{ cursor: tech.aadhaarImage ? "pointer" : "default" }}
                title={tech.aadhaarImage ? "Click to view Aadhaar" : ""}
              >
                {tech.aadhaarImage ? (
                  <img
                    src={
                      tech.aadhaarImage.startsWith("data:")
                        ? tech.aadhaarImage
                        : `data:image/jpeg;base64,${tech.aadhaarImage}`
                    }
                    alt="Aadhaar"
                    className="aadhaar-image"
                  />
                ) : (
                  <div className="no-image">
                    <i className="fas fa-image"></i>
                    <p>No Image Available</p>
                  </div>
                )}
              </div>

              <div className="technician-content">
                <div className="technician-header">
                  <h3 className="technician-name">{tech.name}</h3>
                  <span className={`status-badge ${tech.status ? 'accepted' : 'pending'}`}>
                    {tech.status ? 'Accepted' : 'Pending'}
                  </span>
                </div>

                <div className="technician-details">
                  <div className="technician-info">
                    <i className="fas fa-briefcase"></i>
                    <span>{tech.field}</span>
                  </div>
                  <div className="technician-info">
                    <i className="fas fa-phone"></i>
                    <span>{tech.phno}</span>
                  </div>
                  <div className="technician-info">
                    <i className="fas fa-envelope"></i>
                    <span>{tech.mail}</span>
                  </div>
                  <div className="technician-info">
                    <i className="fas fa-clock"></i>
                    <span>{tech.experience} years experience</span>
                  </div>
                </div>

                {!tech.status && (
                  <div className="action-buttons">
                    <button
                      className="btn-accept"
                      onClick={() => handleAccept(tech._id)}
                    >
                      <i className="fas fa-check"></i>
                      Accept
                    </button>
                    <button
                      className="btn-decline"
                      onClick={() => handleDecline(tech._id)}
                    >
                      <i className="fas fa-times"></i>
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;