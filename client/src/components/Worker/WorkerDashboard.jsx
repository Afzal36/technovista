import React, { useEffect, useState } from "react";
import "./WorkerDashboard.css";
import socket from "../../socket";
import ChatBox from "../Chat/ChatBox";

function WorkerDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("assigned");
  const [assignedStatusFilter, setAssignedStatusFilter] = useState("all");
  const [activeChatEmail, setActiveChatEmail] = useState(null);

  // Get logged-in worker info from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // MAKE SURE TECHNICIAN CONNECTS TO SOCKET
  useEffect(() => {
    console.log("WorkerDashboard: User from localStorage:", user);
    
    // Define handleConnect outside so it's always in scope
    const handleConnect = () => {
      if (user && user.email) {
        console.log("WorkerDashboard: Socket connected, joining room again");
        socket.emit("join-room", { email: user.email });
      }
    };

    if (user && user.email) {
      console.log("WorkerDashboard: Connecting technician to socket with email:", user.email);
      // Connect to socket and join room
      socket.emit("join-room", { email: user.email });
      socket.on("connect", handleConnect);
      // If already connected, join room immediately
      if (socket.connected) {
        socket.emit("join-room", { email: user.email });
      }
    } else {
      console.error("WorkerDashboard: No user email found in localStorage!");
    }

    // Cleanup
    return () => {
      socket.off("connect", handleConnect);
    };
  }, [user.email]);

  // Get logged-in worker info from localStorage
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
  fetch("https://technovista-nine.vercel.app/api/issues/minimal-report")
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
      .catch((err) => {
        console.error("Error fetching reports:", err);
        setLoading(false);
      });
  }, [workerCategory]);

  // Accept a report: set status to "progress" and assignedTo to worker email
  const handleAcceptReport = async (reportId, userEmail) => {
    try {
      console.log("Accepting report:", reportId, "for user:", userEmail);
      console.log("Technician email:", user.email);
      
  const res = await fetch(`https://technovista-nine.vercel.app/api/issues/minimal-report/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "progress",
          assignedTo: user.email // Use email from localStorage
        })
      });
      
      if (res.ok) {
        const updatedReport = await res.json();
        setReports((prev) =>
          prev.map((r) =>
            r._id === reportId
              ? { ...r, status: "progress", assignedTo: user.email }
              : r
          )
        );
        
        console.log("WorkerDashboard: Starting chat with user:", userEmail);
        setActiveChatEmail(userEmail);
        
        // Make sure we're still connected when starting chat
        socket.emit("join-room", { email: user.email });
        
      } else {
        const errorData = await res.json();
        console.error("Failed to accept report:", errorData);
        alert("Failed to accept report: " + (errorData.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error accepting report:", err);
      alert("Error: " + err.message);
    }
  };

  // Calculate stats
  const totalReports = reports.length;
  const assignedToMe = reports.filter(report => report.assignedTo === user.email).length;

  // Filter reports based on selected filter and status filter
  let displayedReports = filter === "assigned"
    ? reports.filter((report) => report.assignedTo === user.email)
    : reports;

  // Apply status filter for assigned reports
  if (filter === "assigned" && assignedStatusFilter !== "all") {
    displayedReports = displayedReports.filter(report => report.status === assignedStatusFilter);
  }

  // Debug function to manually reconnect (remove in production)
  const handleManualReconnect = () => {
    console.log("Manual socket reconnection for:", user.email);
    socket.emit("join-room", { email: user.email });
  };

  return (
    <div className="worker-dashboard-container">
      {/* Debug button - remove in production */}
      

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
                  onClick={() => handleAcceptReport(report._id, report.email)}
                >
                  Accept Report
                </button>
              )}
              {report.status === "progress" && report.assignedTo === user.email && (
                <>
                  <span className="worker-progress-badge">Accepted by you</span>
                  <button
                    className="chat-button"
                    onClick={() => {
                      console.log("Opening chat with user:", report.email);
                      setActiveChatEmail(report.email);
                    }}
                  >
                    Chat with User
                  </button>
                  <button
                    className="mark-complete-btn"
                    style={{ marginLeft: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}
                    onClick={async () => {
                      try {
                        const res = await fetch(`https://technovista-nine.vercel.app/api/issues/minimal-report/${report._id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "resolved" })
                        });
                        if (res.ok) {
                          setReports(prev => prev.map(r => r._id === report._id ? { ...r, status: "resolved" } : r));
                        } else {
                          alert("Failed to mark as complete");
                        }
                      } catch (err) {
                        alert("Error: " + err.message);
                      }
                    }}
                  >
                    Mark as Complete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Show chat box when a report is accepted */}
      {activeChatEmail && (
        <ChatBox 
          myEmail={user.email} 
          targetEmail={activeChatEmail}
          onClose={() => setActiveChatEmail(null)}
        />
      )}
    </div>
  );
}

export default WorkerDashboard;