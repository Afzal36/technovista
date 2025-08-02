import React, { useEffect, useState } from "react";
import "./WorkerDashboard.css";

function WorkerDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("assigned"); // "assigned" or "all"
  const [assignedStatusFilter, setAssignedStatusFilter] = useState("all"); // "all", "progress", "completed"

  // Get logged-in worker info from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const workerField = user.field ? user.field.toLowerCase() : "";

  // Map worker field to report category
  const fieldCategoryMap = {
    electrician: "electrician",
    plumber: "plumber",
    carpenter: "carpenter",
    mason: "mason",
    painter: "painter",
    other: "other"
  };

  // Get the category for this worker
  const workerCategory = fieldCategoryMap[workerField] || workerField;

  // Fetch reports for this worker's category
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/issues/minimal-report")
      .then((res) => res.json())
      .then((data) => {
        // Only show reports matching worker's category
        const filtered = data.filter(
          (report) =>
            report.category &&
            report.category.toLowerCase() === workerCategory
        );
        setReports(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [workerCategory]);

  // Accept a report: set status to "progress" and assignedTo to worker name
  const handleAcceptReport = async (reportId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/issues/minimal-report/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "progress",
          assignedTo: user.name
        })
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) =>
            r._id === reportId
              ? { ...r, status: "progress", assignedTo: user.name }
              : r
          )
        );
      } else {
        alert("Failed to accept report");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Calculate stats
  const totalReports = reports.length;
  const assignedToMe = reports.filter(report => report.assignedTo === user.name).length;

  // Filter reports based on selected filter and status filter
  let displayedReports = filter === "assigned"
    ? reports.filter((report) => report.assignedTo === user.name)
    : reports;

  // Apply status filter for assigned reports
  if (filter === "assigned" && assignedStatusFilter !== "all") {
    displayedReports = displayedReports.filter(report => report.status === assignedStatusFilter);
  }

  return (
    <div className="worker-dashboard-container">
      

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalReports}</div>
            <div className="stat-label">Total Reports</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon assigned">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{assignedToMe}</div>
            <div className="stat-label">Assigned to Me</div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="main-filters">
          <button
            className={`filter-btn${filter === "assigned" ? " active" : ""}`}
            onClick={() => setFilter("assigned")}
          >
            <i className="fas fa-user"></i>
            Assigned to Me
          </button>
          <button
            className={`filter-btn${filter === "all" ? " active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <i className="fas fa-list"></i>
            All {user.field} Reports
          </button>
        </div>

        {/* Status filter for assigned reports */}
        {filter === "assigned" && (
          <div className="status-filters">
            <span className="filter-label">Status:</span>
            <button
              className={`status-filter-btn${assignedStatusFilter === "all" ? " active" : ""}`}
              onClick={() => setAssignedStatusFilter("all")}
            >
              All
            </button>
            <button
              className={`status-filter-btn${assignedStatusFilter === "progress" ? " active" : ""}`}
              onClick={() => setAssignedStatusFilter("progress")}
            >
              In Progress
            </button>
            <button
              className={`status-filter-btn${assignedStatusFilter === "completed" ? " active" : ""}`}
              onClick={() => setAssignedStatusFilter("completed")}
            >
              Completed
            </button>
          </div>
        )}
      </div>

      {/* Reports Section */}
      <div className="reports-section">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading reports...</div>
          </div>
        ) : displayedReports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="empty-text">No reports found for this filter.</div>
          </div>
        ) : (
          // Replace the reports-grid section with:

<div className="worker-reports-grid">
  {displayedReports.map((report) => (
    <div key={report._id} className="worker-report-card">
      <div className="worker-report-header">
        <div className="worker-report-title">{report.label}</div>
        <div className={`status-badge status-${report.status}`}>
          {report.status === "none" ? "Unassigned" :
           report.status === "progress" ? "In Progress" :
           report.status === "completed" ? "Completed" : report.status}
        </div>
      </div>

      <div className="worker-report-details">
        <div className="worker-detail-item">
          <i className="fas fa-phone"></i>
          <span>{report.phone}</span>
        </div>
        <div className="worker-detail-item">
          <i className="fas fa-map-marker-alt"></i>
          <span>{report.address}</span>
        </div>
        <div className="worker-detail-item">
          <i className="fas fa-tag"></i>
          <span>{report.category}</span>
        </div>
        <div className="worker-detail-item">
          <i className="fas fa-user"></i>
          <span>Assigned: {report.assignedTo || "Unassigned"}</span>
        </div>
        <div className="worker-detail-item">
          <i className="fas fa-clock"></i>
          <span>{new Date(report.reportedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="worker-report-actions">
        {report.status === "none" && (
          <button
            className="accept-btn"
            onClick={() => handleAcceptReport(report._id)}
          >
            <i className="fas fa-check"></i>
            Accept Report
          </button>
        )}
        {report.status === "progress" && report.assignedTo === user.name && (
          <div className="progress-indicator">
            <i className="fas fa-cog fa-spin"></i>
            Working on this
          </div>
        )}
      </div>
    </div>
  ))}
</div>
        )}
      </div>
    </div>
  );
}

export default WorkerDashboard;