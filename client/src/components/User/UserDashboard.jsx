import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, AlertTriangle, LogOut } from 'lucide-react';
import './UserDashBoard.css';

const UserDashBoard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('my-communities');

  // Static data for My Communities
  const myCommunities = [
    { 
      id: 1, 
      name: 'Downtown Office Complex', 
      members: 45, 
      issues: 3, 
      resolved: 28,
      icon: ' '
    },
    { 
      id: 2, 
      name: 'VNR hostels', 
      members: 800, 
      issues: 1, 
      resolved: 15,
      icon: ' '
    },
    { 
      id: 3, 
      name: 'Industrial Park West', 
      members: 67, 
      issues: 5, 
      resolved: 42,
      icon: ' '
    },
    { 
      id: 4, 
      name: 'Shopping Center Plaza', 
      members: 89, 
      issues: 2, 
      resolved: 56,
      icon: ' '
    }
  ];

  // Static data for Explore Communities
  const exploreCommunities = [

    {
      id: 2,
      name: 'Green Valley Apartments',
      description: 'Eco-friendly residential community focused on sustainable maintenance practices and green living solutions.',
      members: 78,
      icon: '🌱',
      rating: 4.6
    },
    {
      id: 3,
      name: 'Harbor Industrial District',
      description: 'Large-scale industrial facilities with comprehensive equipment monitoring and predictive maintenance systems.',
      members: 234,
      icon: '⚙️',
      rating: 4.9
    },
    {
      id: 4,
      name: 'City Center Mall',
      description: 'Retail complex with integrated maintenance management for all tenant spaces and common areas.',
      members: 123,
      icon: '🏬',
      rating: 4.7
    }
  ];

  const handleLeave = (communityId) => {
    console.log(`Leaving community ${communityId}`);
    // Add your leave community logic here
  };

  const handleReportIssue = () => {
    navigate('/report-issue');
  };

  const handleJoinCommunity = (communityId) => {
    console.log(`Joining community ${communityId}`);
    // Add your join community logic here
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="user-dashboard">
      {/* Left Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">MaintenanceAI</h1>
          <p className="sidebar-subtitle">Smart Facility Management</p>
        </div>

        <nav className="dashboard-navigation">
          <ul className="nav-list">
            <li>
              <button
                onClick={() => handleSectionChange('my-communities')}
                className={`nav-item ${
                  activeSection === 'my-communities' ? 'active' : ''
                }`}
              >
                <Users className="nav-icon" />
                <span>My Communities</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange('explore-communities')}
                className={`nav-item ${
                  activeSection === 'explore-communities' ? 'active' : ''
                }`}
              >
                <Search className="nav-icon" />
                <span>Explore Communities</span>
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
              {activeSection === 'my-communities' ? 'My Communities' : 'Explore Communities'}
            </h2>
            <p className="content-description">
              {activeSection === 'my-communities' 
                ? 'Manage your active community memberships and report maintenance issues'
                : 'Discover and join new maintenance communities in your area'
              }
            </p>
          </div>

          {/* Content based on active section */}
          <div className="section-content">
            {activeSection === 'my-communities' && (
              <div className="community-grid">
                {myCommunities.map((community) => (
                  <div key={community.id} className="community-card">
                    <div className="community-card-image">
                      <div className="community-card-icon">{community.icon}</div>
                    </div>
                    
                    <div className="community-card-body">
                      <div className="card-header">
                        <h3 className="card-title">{community.name}</h3>
                        <p className="card-member-count">{community.members} members</p>
                      </div>

                      <div className="card-stats">
                        <div className="card-stat">
                          <p className="card-stat-value">{community.issues}</p>
                          <p className="card-stat-label">Open Issues</p>
                        </div>
                        <div className="card-stat">
                          <p className="card-stat-value">{community.resolved}</p>
                          <p className="card-stat-label">Resolved</p>
                        </div>
                        <div className="card-stat">
                          <p className="card-stat-value">{Math.round((community.resolved / (community.resolved + community.issues)) * 100)}%</p>
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

            {activeSection === 'explore-communities' && (
              <div className="community-grid">
                {exploreCommunities.map((community) => (
                  <div key={community.id} className="explore-card">
                    <div className="card-image">
                      🏢
                    </div>
                    
                    <div className="card-content">
                      <h3 className="explore-card-title">{community.name}</h3>
                      <p className="card-description">{community.description}</p>
                      <p className="card-member-info">{community.members} members</p>
                      
                      <button
                        onClick={() => handleJoinCommunity(community.id)}
                        className="join-button"
                      >
                        <Plus className="join-button-icon" />
                        Join Community
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashBoard;