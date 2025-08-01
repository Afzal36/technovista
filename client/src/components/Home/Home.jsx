import React, { useState, useEffect } from 'react';
import './Home.css';

const Home = ({ onSigninClick, onSignupClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="homeContainer">
      {/* Navigation */}
       <nav className={`navbar ${isLoaded ? 'fadeIn' : ''}`}>
        <div className="logo">
          MaintenanceAI
        </div>
        <div className="navLinks">
        </div>
        <div className="navButtons">
          <button className="signInBtn" onClick={onSigninClick}>
            Sign In
          </button>
          <button className="signUpBtn" onClick={onSignupClick}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className={`heroContent ${isLoaded ? 'slideInLeft' : ''}`}>
          <h1 className="headline">
            Intelligent Maintenance. 
            <br />
            Instant Response.
          </h1>
          <p className="subheadline">
            AI-powered issue detection and technician dispatch built for institutions.
            Reduce triaging errors and improve response times with smart maintenance management.
          </p>
          <div className="ctaButtons">
            <button className="primaryBtn">
              Get Started
            </button>
            <button className="secondaryBtn">
              Learn More
            </button>
          </div>
          <div className="statsRow">
            <div className="stat">
              <span className="statNumber">85%</span>
              <span className="statLabel">Faster Response</span>
            </div>
            <div className="stat">
              <span className="statNumber">92%</span>
              <span className="statLabel">Accuracy Rate</span>
            </div>
            <div className="stat">
              <span className="statNumber">500+</span>
              <span className="statLabel">Institutions</span>
            </div>
          </div>
        </div>

        <div className={`heroIllustration ${isLoaded ? 'slideInRight' : ''}`}>
          <div className="illustrationCard">
            <div className="aiIcon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6"/>
                <path d="m21 12-6-3-6 3-6-3"/>
                <path d="m21 12-6 3-6-3-6 3"/>
                <path d="M12 1L9 9l9 3-9 3 3 8"/>
              </svg>
            </div>
            <h3 className="cardTitle">AI Issue Classification</h3>
            <p className="cardDescription">
              Upload images and descriptions. Our AI instantly categorizes maintenance issues and routes them to the right technicians.
            </p>
            <div className="featuresGrid">
              <div className="feature">
                <div className="featureIcon">🔧</div>
                <span>Plumbing</span>
              </div>
              <div className="feature">
                <div className="featureIcon">⚡</div>
                <span>Electrical</span>
              </div>
              <div className="feature">
                <div className="featureIcon">🏗️</div>
                <span>Civil</span>
              </div>
              <div className="feature">
                <div className="featureIcon">🌡️</div>
                <span>HVAC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="sectionContainer">
          <div className="sectionHeader">
            <h2 className="sectionTitle">Why Choose MaintenanceAI?</h2>
            <p className="sectionSubtitle">
              Transform your maintenance operations with cutting-edge AI technology
            </p>
          </div>
          
          <div className="featuresGrid">
            <div className="featureCard">
              <div className="featureCardIcon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h9l4 4-4 4H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18c.552 0 1-.448 1-1v-6c0-.552-.448-1-1-1h-9l-4-4 4-4h9z"/>
                </svg>
              </div>
              <h3 className="featureCardTitle">Smart Issue Detection</h3>
              <p className="featureCardDesc">
                Advanced computer vision analyzes uploaded images to identify maintenance issues with 92% accuracy.
              </p>
            </div>

            <div className="featureCard">
              <div className="featureCardIcon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="m22 21-3-3m0 0-3-3m3 3h-6"/>
                </svg>
              </div>
              <h3 className="featureCardTitle">Instant Technician Routing</h3>
              <p className="featureCardDesc">
                Automatically dispatch the right specialist based on issue type, location, and technician availability.
              </p>
            </div>

            <div className="featureCard">
              <div className="featureCardIcon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
                  <path d="M9 1v6M20 9h3M15 20v3M1 15h6"/>
                </svg>
              </div>
              <h3 className="featureCardTitle">Real-time Tracking</h3>
              <p className="featureCardDesc">
                Monitor progress from issue submission to resolution with live updates and status notifications.
              </p>
            </div>

            <div className="featureCard">
              <div className="featureCardIcon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v6l3-3M6 18l3-3v6M18 6l-3 3h6M6 6h6L9 9"/>
                </svg>
              </div>
              <h3 className="featureCardTitle">Analytics Dashboard</h3>
              <p className="featureCardDesc">
                Comprehensive insights into maintenance trends, response times, and operational efficiency.
              </p>
            </div>

            <div className="featureCard">
              <div className="featureCardIcon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <h3 className="featureCardTitle">Enterprise Security</h3>
              <p className="featureCardDesc">
                Bank-level encryption and compliance with institutional security standards and regulations.
              </p>
            </div>

            <div className="featureCard">
              <div className="featureCardIcon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  <path d="m9 14 2 2 4-4"/>
                </svg>
              </div>
              <h3 className="featureCardTitle">Digital Work Orders</h3>
              <p className="featureCardDesc">
                Paperless workflow with automated work order generation, status updates, and completion tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="howItWorks">
        <div className="sectionContainer">
          <div className="sectionHeader">
            <h2 className="sectionTitle">How It Works</h2>
            <p className="sectionSubtitle">
              Simple, efficient, and intelligent maintenance management in three steps
            </p>
          </div>

          <div className="stepsContainer">
            <div className="step">
              <div className="stepNumber">1</div>
              <div className="stepContent">
                <h3 className="stepTitle">Report Issue</h3>
                <p className="stepDescription">
                  Residents or staff upload photos and descriptions through our mobile app or web portal.
                </p>
              </div>
            </div>

            <div className="stepArrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </div>

            <div className="step">
              <div className="stepNumber">2</div>
              <div className="stepContent">
                <h3 className="stepTitle">AI Analysis</h3>
                <p className="stepDescription">
                  Our AI instantly analyzes the issue, categorizes it, and determines priority and required expertise.
                </p>
              </div>
            </div>

            <div className="stepArrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </div>

            <div className="step">
              <div className="stepNumber">3</div>
              <div className="stepContent">
                <h3 className="stepTitle">Dispatch & Resolve</h3>
                <p className="stepDescription">
                  The right technician is automatically notified and dispatched with all necessary information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutions Section */}
      <section className="institutions">
        <div className="sectionContainer">
          <div className="sectionHeader">
            <h2 className="sectionTitle">Built for Institutions</h2>
            <p className="sectionSubtitle">
              Trusted by leading organizations worldwide
            </p>
          </div>

          <div className="institutionsGrid">
            <div className="institutionCard">
              <div className="institutionIcon">🏫</div>
              <h3 className="institutionTitle">Universities</h3>
              <p className="institutionDesc">
                Manage campus-wide maintenance across dormitories, academic buildings, and facilities.
              </p>
            </div>

            <div className="institutionCard">
              <div className="institutionIcon">🏘️</div>
              <h3 className="institutionTitle">Gated Communities</h3>
              <p className="institutionDesc">
                Streamline resident requests and maintain common areas efficiently.
              </p>
            </div>

            <div className="institutionCard">
              <div className="institutionIcon">🏨</div>
              <h3 className="institutionTitle">Hostels & Housing</h3>
              <p className="institutionDesc">
                Ensure quick resolution of maintenance issues in shared living spaces.
              </p>
            </div>

            <div className="institutionCard">
              <div className="institutionIcon">🏢</div>
              <h3 className="institutionTitle">Corporate Offices</h3>
              <p className="institutionDesc">
                Maintain professional work environments with minimal downtime.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="footer">
        <div className="sectionContainer">
          <div className="footerContent">
            <div className="footerBrand">
              <div className="logo">MaintenanceAI</div>
              <p className="footerDesc">
                Intelligent maintenance management for modern institutions.
              </p>
            </div>
            
            <div className="footerLinks">
              <div className="footerColumn">
                <h4 className="footerTitle">Product</h4>
                <a href="#" className="footerLink">Features</a>
                <a href="#" className="footerLink">Pricing</a>
                <a href="#" className="footerLink">Integrations</a>
                <a href="#" className="footerLink">API</a>
              </div>
              
              <div className="footerColumn">
                <h4 className="footerTitle">Company</h4>
                <a href="#" className="footerLink">About Us</a>
                <a href="#" className="footerLink">Careers</a>
                <a href="#" className="footerLink">Blog</a>
                <a href="#" className="footerLink">Contact</a>
              </div>
              
              <div className="footerColumn">
                <h4 className="footerTitle">Support</h4>
                <a href="#" className="footerLink">Help Center</a>
                <a href="#" className="footerLink">Documentation</a>
                <a href="#" className="footerLink">Status</a>
                <a href="#" className="footerLink">Security</a>
              </div>
            </div>
          </div>
          
          <div className="footerBottom">
            <p>&copy; 2024 MaintenanceAI. All rights reserved.</p>
            <div className="footerBottomLinks">
              <a href="#" className="footerBottomLink">Privacy Policy</a>
              <a href="#" className="footerBottomLink">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;