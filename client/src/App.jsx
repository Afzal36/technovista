import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/SignUp/Signup";
import Signin from "./components/Signin/Signin";
import UserDashboard from "./components/User/UserDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import WorkerDashboard from "./components/Worker/WorkerDashboard";
import Home from "./components/Home/Home";
import ReportIssue from "./components/User/ReportIssue";
import SubscriptionPlans from "./components/Admin/AdminPaymentPage";
import "./App.css";

const getDashboardComponent = (role) => {
  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "worker":
      return <WorkerDashboard />;
    default:
      return <UserDashboard />;
  }
};

const ProtectedRoute = ({ isAuth, children }) => {
  return isAuth ? children : <Navigate to="/" />;
};

const App = () => {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "");
  const [showSignin, setShowSignin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleAuth = (token) => {
    setIsAuth(true);
    setUserRole(localStorage.getItem("role"));
    setShowSignin(false);
    setShowSignup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuth(false);
    setUserRole("");
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("auth-container")) {
      setShowSignin(false);
      setShowSignup(false);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Home
                onSigninClick={() => setShowSignin(true)}
                onSignupClick={() => setShowSignup(true)}
              />
              {showSignin && (
                <div className="auth-container" onClick={handleOverlayClick}>
                  <Signin
                    onAuth={handleAuth}
                    onClose={() => setShowSignin(false)}
                    onSwitchToSignup={() => {
                      setShowSignin(false);
                      setShowSignup(true);
                    }}
                  />
                </div>
              )}
              {showSignup && (
                <div className="auth-container" onClick={handleOverlayClick}>
                  <Signup
                    onAuth={handleAuth}
                    onClose={() => setShowSignup(false)}
                    onSwitchToSignin={() => {
                      setShowSignin(true);
                      setShowSignup(false);
                    }}
                  />
                </div>
              )}
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuth={isAuth}>
              {getDashboardComponent(userRole)}
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-issue"
          element={
            <ProtectedRoute isAuth={isAuth}>
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sub"
          element={<SubscriptionPlans />}
        />
        <Route path="*" element={<Navigate to={isAuth ? "/dashboard" : "/"} />} />
      </Routes>
    </Router>
  );
};

export default App;