import React, { useEffect, useState } from "react";
import "./WorkerDashboard.css";

function WorkerDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("assigned"); // "assigned" or "all"

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

  // Filter reports based on selected filter
  const displayedReports =
    filter === "assigned"
      ? reports.filter((report) => report.assignedTo === user.name)
      : reports;

  return (
    <div className="worker-dashboard-container">
      <h2 className="worker-dashboard-title">
        {user.name ? `${user.name}'s` : "Worker"} Issue Reports
      </h2>
      <div className="worker-dashboard-subtitle">
        Showing reports for: <span className="worker-field">{user.field || "N/A"}</span>
      </div>
      <div className="worker-filter-row">
        <button
          className={`worker-filter-btn${filter === "assigned" ? " active" : ""}`}
          onClick={() => setFilter("assigned")}
        >
          Assigned to Me
        </button>
        <button
          className={`worker-filter-btn${filter === "all" ? " active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All {user.field} Reports
        </button>
      </div>
      {loading ? (
        <div className="worker-loading">Loading reports...</div>
      ) : displayedReports.length === 0 ? (
        <div className="worker-empty">
          <i className="fas fa-check-circle"></i>
          No reports found for this filter.
        </div>
      ) : (
        <div className="worker-reports-list">
          {displayedReports.map((report) => (
            <div key={report._id} className="worker-report-card">
              <div className="worker-report-label">{report.label}</div>
              <div className="worker-report-info">
                <span>
                  <i className="fas fa-phone"></i> {report.phone}
                </span>
                <span>
                  <i className="fas fa-map-marker-alt"></i> {report.address}
                </span>
                <span>
                  <i className="fas fa-tag"></i> {report.category}
                </span>
                <span>
                  <i className="fas fa-user"></i> Assigned to: {report.assignedTo || "Unassigned"}
                </span>
                <span>
                  <i className="fas fa-clock"></i>{" "}
                  {new Date(report.reportedAt).toLocaleString()}
                </span>
                <span>
                  <i className="fas fa-info-circle"></i> Status: {report.status}
                </span>
              </div>
              {report.status === "none" && (
                <button
                  className="worker-accept-btn"
                  onClick={() => handleAcceptReport(report._id)}
                >
                  Accept Report
                </button>
              )}
              {report.status === "progress" && report.assignedTo === user.name && (
                <span className="worker-progress-badge">Accepted by you</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkerDashboard;