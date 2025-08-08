import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = ({ onSigninClick, onSignupClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handlePricingButtonClick = () => {
    navigate('/sub');
  };

  return (
    <div className="homeContainer">
      {/* Navigation */}
       <nav className={`navbar ${isLoaded ? 'fadeIn' : ''}`}>
        <div className="logo">
          <span className='black123'>Maint<span className='green123'>ai</span>nance</span> 
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
            Intelligent M<span className='colred'>ai</span>ntenance. 
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
              
              <span className="statLabel">Faster Response</span>
            </div>
            <div className="stat">

              <span className="statLabel">Accuracy Rate</span>
            </div>
            <div className="stat">

              <span className="statLabel">Institutional</span>
            </div>
          </div>
        </div>

        <div className={`heroIllustration ${isLoaded ? 'slideInRight' : ''}`}>
          <img 
            src="https://i.postimg.cc/7YDmxYyF/italy.png"
            alt="Maintenance Management Illustration"
            className="hero-image"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
  <div className="sectionContainer">
    <div className="features-wrapper">
      <div className="features-image">
        <img 
          src="https://i.postimg.cc/ZRq82Ctm/solution.png" 
          alt="Maintenance Features"
          className="feature-img"
        />
      </div>
      <div className="features-content">
        <div className="title-wrapper">
          <span className="subtitle">AI-Powered Platform</span>
          <h2 className="features-title">
            Smart Maintenance
            <span className="highlight"> Solutions</span>
          </h2>
        </div>
        <p className="features-description">
          Experience the future of facility management. Our platform combines cutting-edge computer vision with smart routing to deliver maintenance solutions that are 92% more accurate and 85% faster than traditional methods.
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

      {/* Pricing Section */}
      <section className="pricing">
        <div className="sectionContainer">
          <div className="sectionHeader">
            <h2 className="sectionTitle">Plans that grow with you</h2>
            <p className="sectionSubtitle">
              Choose the perfect plan for your maintenance needs
            </p>

          </div>

          <div className="pricingGrid">
            <div className="pricingCard">
              <div className="planIcon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <h3 className="planTitle">Starter</h3>
              <p className="planSubtitle"><b>Users:</b> 0 - 10</p>

              <div className="priceSection">
                <span className="currency">USD</span>
                <span className="price">0</span>
              </div>
              
              <button 
                className="planButton secondary"
                onClick={handlePricingButtonClick}
              >
                Start Free
              </button>
              
              <div className="featuresList">
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Up to 10 maintenance requests/month
                </div>
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Basic AI analysis
                </div>
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Email notifications
                </div>
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Mobile app access
                </div>
              </div>
            </div>

            <div className="pricingCard featured">
              <div className="popularBadge">Most Popular</div>
              <div className="planIcon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              </div>
              <h3 className="planTitle">Professional</h3>
              <p className="planSubtitle"><b>Users:</b> 10 - 150</p>

              <div className="priceSection">
                <span className="currency">USD</span>
                <span className="price">10</span>
                <span className="period">/month</span>
              </div>
              
              <button 
                className="planButton primary"
                onClick={handlePricingButtonClick}
              >
                Get Professional
              </button>
              
              <div className="featuresList">
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Everything in Starter, plus:
                </div>
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Unlimited maintenance requests
                </div>
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Advanced AI prioritization
                </div>
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Real-time technician tracking
                </div>
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Analytics dashboard
                </div>
              </div>
            </div>

            <div className="pricingCard">
              <div className="planIcon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3 className="planTitle">Enterprise</h3>
              <p className="planSubtitle"><b>Users :</b> 150 +</p>

              <div className="priceSection">
                <span className="customPrice">Custom</span>
              </div>
              
              <button 
                className="planButton secondary"
                onClick={handlePricingButtonClick}
              >
                Contact Sales
              </button>
              
              <div className="featuresList">
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Everything in Professional, plus:
                </div>
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Multi-location management
                </div>
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Custom integrations
                </div>
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Dedicated support
                </div>
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  SLA guarantees
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="footer">
  <div className="sectionContainer">
    <div className="footerContent">
      <div className="footerBrand">
                <div className="logo">
          <span className='black1234'>Maint<span className='green123'>ai</span>nance</span> 
        </div>
      </div>
      <div className="footerLinks">
        <a href="#features" className="footerLink">About</a>
        <a href="#" className="footerLink">Contact</a>
      </div>
    </div>
    <div className="footerBottom">
      <p>&copy; Team Lumora</p>
    </div>
  </div>
</footer>
    </div>
  );
};

export default Home;