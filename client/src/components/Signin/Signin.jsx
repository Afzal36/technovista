import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signin.css";

const Signin = ({ onAuth, onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleEmailSignin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        onAuth(data.token);

        if (data.role === "admin") {
          navigate("/dashboard");
        } else if (data.role === "worker") {
          if (data.status === true) {
            navigate("/dashboard");
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            alert("Your application has not been approved by the admin yet.");
            navigate("/");
          }
        } else {
          navigate("/dashboard");
        }
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="auth-modal">
      <button className="close-button" onClick={onClose}>×</button>
      <h3>Welcome back.</h3>
      <div className="auth-form">
        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="auth-button email" onClick={handleEmailSignin}>
          Sign in with Email
        </button>
      </div>
      <div className="auth-links">
        No account? <a href="#" onClick={e => {e.preventDefault(); onSwitchToSignup();}}>Create one</a>
      </div>
    </div>
  );
};

export default Signin;