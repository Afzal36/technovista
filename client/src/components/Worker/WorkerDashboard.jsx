import React, { useEffect, useState } from "react";
import "./WorkerDashboard.css";

function WorkerDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
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

  return (
    <div className="worker-dashboard-container">
      <h2 className="worker-dashboard-title">
        {user.name ? `${user.name}'s` : "Worker"} Issue Reports
      </h2>
      <div className="worker-dashboard-subtitle">
        Showing reports for: <span className="worker-field">{user.field || "N/A"}</span>
      </div>
      {loading ? (
        <div className="worker-loading">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="worker-empty">
          <i className="fas fa-check-circle"></i>
          No reports found for your category.
        </div>
      ) : (
        <div className="worker-reports-list">
          {reports.map((report) => (
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
                  <i className="fas fa-clock"></i>{" "}
                  {new Date(report.reportedAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkerDashboard;