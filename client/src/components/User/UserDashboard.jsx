import { useState, useEffect } from "react";
import socket from "../../socket";
import ChatBox from "../Chat/ChatBox";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Plus,
  AlertTriangle,
  LogOut,
  FileText,
} from "lucide-react";
import "./UserDashBoard.css";

const UserDashBoard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("my-communities");
  const [myReports, setMyReports] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [activeChatEmail, setActiveChatEmail] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // Initialize socket connection and register user
  useEffect(() => {
    if (!user.email) return;

    const initializeSocket = () => {
      // Register user with socket
      socket.emit("register", { userId: user.email });
      
      // Set up connection status listeners
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setSocketConnected(true);
        // Re-register on reconnection
        socket.emit("register", { userId: user.email });
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      });

      // Listen for chat_started event from backend
      const handleChatStarted = ({ with: otherEmail }) => {
        console.log('Chat started event received:', otherEmail);
        setActiveChatEmail(otherEmail);
      };

      socket.on('chat_started', handleChatStarted);

      // Clean up listeners on unmount
      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('chat_started', handleChatStarted);
      };
    };

    const cleanup = initializeSocket();
    return cleanup;
  }, [user.email]);

  // Static data for My Communities
  const myCommunities = [
    {
      id: 1,
      name: "Downtown Office Complex",
      members: 45,
      issues: 3,
      resolved: 28,
      icon: " ",
    },
    {
      id: 2,
      name: "VNR hostels",
      members: 800,
      issues: 1,
      resolved: 15,
      icon: " ",
    },
    {
      id: 3,
      name: "Industrial Park West",
      members: 67,
      issues: 5,
      resolved: 42,
      icon: " ",
    },
    {
      id: 4,
      name: "Shopping Center Plaza",
      members: 89,
      issues: 2,
      resolved: 56,
      icon: " ",
    },
  ];

  // Static data for Explore Communities
  const exploreCommunities = [
    {
      id: 2,
      name: "Green Valley Apartments",
      description:
        "Eco-friendly residential community focused on sustainable maintenance practices and green living solutions.",
      members: 78,
      icon: "🌱",
      rating: 4.6,
    },
    {
      id: 3,
      name: "Harbor Industrial District",
      description:
        "Large-scale industrial facilities with comprehensive equipment monitoring and predictive maintenance systems.",
      members: 234,
      icon: "⚙️",
      rating: 4.9,
    },
    {
      id: 4,
      name: "City Center Mall",
      description:
        "Retail complex with integrated maintenance management for all tenant spaces and common areas.",
      members: 123,
      icon: "🏬",
      rating: 4.7,
    },
  ];

  // Fetch reports reported by the logged-in user
  useEffect(() => {
    if (!user || !user.email) return;
    
    const fetchReports = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/issues/minimal-report");
        const data = await response.json();
        // Filter reports by email instead of phone
        const filtered = data.filter((report) => report.email === user.email);
        setMyReports(filtered);
        console.log('Filtered reports:', filtered);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, [user.email]);

  const handleLeave = (communityId) => {
    console.log(`Leaving community ${communityId}`);
    // Add your leave community logic here
  };

  const handleReportIssue = () => {
    navigate("/report-issue");
  };

  const handleJoinCommunity = (communityId) => {
    console.log(`Joining community ${communityId}`);
    // Add your join community logic here
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleStartChat = (targetEmail) => {
    if (!socketConnected) {
      console.error('Socket not connected');
      return;
    }
    
    console.log('Starting chat with:', targetEmail);
    setActiveChatEmail(targetEmail);
    
    // Optionally emit a chat_start event to the server
    socket.emit('start_chat', {
      from: user.email,
      to: targetEmail
    });
  };

  const handleCloseChat = () => {
    setActiveChatEmail(null);
  };

  return (
    <div className="user-dashboard">
      {/* Left Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">MaintenanceAI</h1>
          <p className="sidebar-subtitle">Smart Facility Management</p>
          {/* Connection status indicator */}
          <div className={`connection-status ${socketConnected ? 'connected' : 'disconnected'}`}>
            {socketConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>

        <nav className="dashboard-navigation">
          <ul className="nav-list">
            <li>
              <button
                onClick={() => handleSectionChange("my-communities")}
                className={`nav-item ${
                  activeSection === "my-communities" ? "active" : ""
                }`}
              >
                <Users className="nav-icon" />
                <span>My Communities</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange("explore-communities")}
                className={`nav-item ${
                  activeSection === "explore-communities" ? "active" : ""
                }`}
              >
                <Search className="nav-icon" />
                <span>Explore Communities</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange("my-reports")}
                className={`nav-item ${
                  activeSection === "my-reports" ? "active" : ""
                }`}
              >
                <FileText className="nav-icon" />
                <span>My Reports</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main-content">
        <div className="content-wrapper">
          {/* Header */}
          <div className="content-header">
            <h2 className="content-title">
              {activeSection === "my-communities"
                ? "My Communities"
                : activeSection === "explore-communities"
                ? "Explore Communities"
                : "My Reports"}
            </h2>
            <p className="content-description">
              {activeSection === "my-communities"
                ? "Manage your active community memberships and report maintenance issues"
                : activeSection === "explore-communities"
                ? "Discover and join new maintenance communities in your area"
                : "View all maintenance reports you have submitted"}
            </p>
          </div>

          {/* Content based on active section */}
          <div className="section-content">
            {activeSection === "my-communities" && (
              <div className="community-grid">
                {myCommunities.map((community) => (
                  <div key={community.id} className="community-card">
                    <div className="community-card-image">
                      <div className="community-card-icon">
                        {community.icon}
                      </div>
                    </div>
                    <div className="community-card-body">
                      <div className="card-header">
                        <h3 className="card-title">{community.name}</h3>
                        <p className="card-member-count">
                          {community.members} members
                        </p>
                      </div>
                      <div className="card-stats">
                        <div className="card-stat">
                          <p className="card-stat-value">{community.issues}</p>
                          <p className="card-stat-label">Open Issues</p>
                        </div>
                        <div className="card-stat">
                          <p className="card-stat-value">
                            {community.resolved}
                          </p>
                          <p className="card-stat-label">Resolved</p>
                        </div>
                        <div className="card-stat">
                          <p className="card-stat-value">
                            {Math.round(
                              (community.resolved /
                                (community.resolved + community.issues)) *
                                100
                            )}
                            %
                          </p>
                          <p className="card-stat-label">Success Rate</p>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button
                          onClick={() => handleReportIssue(community.id)}
                          className="report-button"
                        >
                          <AlertTriangle className="button-icon" />
                          Report Issue
                        </button>
                        <button
                          onClick={() => handleLeave(community.id)}
                          className="leave-button"
                          title="Leave Community"
                        >
                          <LogOut className="button-icon" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === "explore-communities" && (
              <div className="community-grid">
                {exploreCommunities.map((community) => (
                  <div key={community.id} className="explore-card">
                    <div className="card-image">{community.icon}</div>
                    <div className="card-content">
                      <h3 className="explore-card-title">{community.name}</h3>
                      <p className="card-description">
                        {community.description}
                      </p>
                      <p className="card-member-info">
                        {community.members} members
                      </p>
                      <button
                        onClick={() => handleJoinCommunity(community.id)}
                        className="join-community-button"
                      >
                        <Plus className="join-button-icon" />
                        Join Community
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === "my-reports" && (
              <div className="reports-container">
                <div className="reports-grid">
                  {myReports.length === 0 ? (
                    <div className="no-reports-msg">
                      No reports submitted by you yet.
                    </div>
                  ) : (
                    myReports.map((report) => (
                      <div key={report._id} className="report-card">
                        <div className="report-card-header">
                          <div className="report-title">
                            <h3>{report.label}</h3>
                          </div>
                        </div>

                        <div className="report-card-body">
                          <div className="info-grid">
                            <div className="info-item">
                              <span className="info-label">Category</span>
                              <span className="info-value">
                                {report.category}
                              </span>
                            </div>

                            <div className="info-item">
                              <span className="info-label">Status</span>
                              <span
                                className={`status-pill status-${report.status}`}
                              >
                                {report.status === "none"
                                  ? "Pending"
                                  : report.status === "progress"
                                  ? "In Progress"
                                  : "Completed"}
                              </span>
                            </div>

                            <div className="info-item full-width">
                              <span className="info-label">Location</span>
                              <span className="info-value with-icon">
                                <svg
                                  className="icon"
                                  viewBox="0 0 24 24"
                                  width="16"
                                  height="16"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                  />
                                </svg>
                                {report.address}
                              </span>
                            </div>
                          </div>

                          <div className="assignment-section">
                            <span className="info-label">Assigned To</span>
                            {report.assignedTo ? (
                              <div className="assignee">
                                <div className="assignee-avatar">
                                  {report.assignedTo.charAt(0)}
                                </div>
                                <div className="assignee-info">
                                  <span className="assignee-name">
                                    {report.assignedTo}
                                  </span>
                                  <span className="assignee-role">
                                    Technician
                                  </span>
                                </div>
                                {/* Chat button for assigned technician */}
                                {report.assignedToEmail ? (
                                  <button
                                    className="chat-button"
                                    onClick={() => handleStartChat(report.assignedToEmail)}
                                    disabled={!socketConnected}
                                  >
                                    {socketConnected ? 'Chat with Technician' : 'Connection Lost'}
                                  </button>
                                ) : (
                                  <span className="chat-unavailable">Chat unavailable</span>
                                )}
                              </div>
                            ) : (
                              <span className="not-assigned">
                                <b>Yet to be assigned</b>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Show chat box when a technician is selected */}
      {activeChatEmail && (
        <ChatBox 
          myEmail={user.email} 
          targetEmail={activeChatEmail}
          onClose={handleCloseChat}
          socket={socket}
        />
      )}
    </div>
  );
};

export default UserDashBoard;