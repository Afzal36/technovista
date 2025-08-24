import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalImage, setModalImage] = useState(null);

  // Fetch all worker requests
  useEffect(() => {
  fetch("https://technovista-backend.onrender.com/api/admin/workers")
      .then((res) => res.json())
      .then((data) => {
        setWorkers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Accept worker
  const handleAccept = async (id) => {
    try {
  const res = await fetch(`https://technovista-backend.onrender.com/api/admin/accept-worker/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setWorkers((prev) =>
          prev.map((worker) =>
            worker._id === id ? { ...worker, status: true } : worker
          )
        );
      }
    } catch (err) {
      alert("Failed to accept request");
    }
  };

  // Decline worker
  const handleDecline = async (id) => {
    try {
  const res = await fetch(`https://technovista-backend.onrender.com/api/admin/workers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWorkers((prev) => prev.filter((worker) => worker._id !== id));
      }
    } catch (err) {
      alert("Failed to decline request");
    }
  };

  // Stats
  const pendingCount = workers.filter(w => !w.status).length;
  const acceptedCount = workers.filter(w => w.status).length;

  // Improved search: search by name, field, email, phone, experience
  const filteredWorkers = workers.filter(worker => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      (worker.name || "").toLowerCase().includes(term) ||
      (worker.field || "").toLowerCase().includes(term) ||
      (worker.email || "").toLowerCase().includes(term) ||
      (worker.phone || "").toLowerCase().includes(term) ||
      String(worker.experience || "").includes(term);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && !worker.status) ||
      (statusFilter === "accepted" && worker.status);

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
              <div className="stats-number">{workers.length}</div>
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
          <p>Loading worker requests...</p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-users empty-icon"></i>
          <h4>No worker requests found</h4>
          <p>Try adjusting your search criteria or check back later.</p>
        </div>
      ) : (
        <div className="technicians-grid">
          {filteredWorkers.map((worker) => (
            <div key={worker._id} className={`technician-card ${worker.status ? "accepted" : "pending"}`}>
              <div
                className="technician-image"
                onClick={() => {
                  if (worker.aadhaarImage) {
                    setModalImage(
                      worker.aadhaarImage.startsWith("data:")
                        ? worker.aadhaarImage
                        : `data:image/jpeg;base64,${worker.aadhaarImage}`
                    );
                  }
                }}
                style={{ cursor: worker.aadhaarImage ? "pointer" : "default" }}
                title={worker.aadhaarImage ? "Click to view Aadhaar" : ""}
              >
                {worker.aadhaarImage ? (
                  <img
                    src={
                      worker.aadhaarImage.startsWith("data:")
                        ? worker.aadhaarImage
                        : `data:image/jpeg;base64,${worker.aadhaarImage}`
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
                  <h3 className="technician-name">{worker.name}</h3>
                  <span className={`status-badge ${worker.status ? 'accepted' : 'pending'}`}>
                    {worker.status ? 'Accepted' : 'Pending'}
                  </span>
                </div>

                <div className="technician-details">
                  <div className="technician-info">
                    <i className="fas fa-briefcase"></i>
                    <span>{worker.field}</span>
                  </div>
                  <div className="technician-info">
                    <i className="fas fa-phone"></i>
                    <span>{worker.phone}</span>
                  </div>
                  <div className="technician-info">
                    <i className="fas fa-envelope"></i>
                    <span>{worker.email}</span>
                  </div>
                  <div className="technician-info">
                    <i className="fas fa-clock"></i>
                    <span>{worker.experience} years experience</span>
                  </div>
                </div>

                {!worker.status && (
                  <div className="action-buttons">
                    <button
                      className="btn-accept"
                      onClick={() => handleAccept(worker._id)}
                    >
                      <i className="fas fa-check"></i>
                      Accept
                    </button>
                    <button
                      className="btn-decline"
                      onClick={() => handleDecline(worker._id)}
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