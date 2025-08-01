import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signin.css";

const Signin = ({ onAuth, onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

<<<<<<< HEAD
  const sendTokenToBackend = async (token) => {
    const res = await fetch("http://localhost:5000/auth", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const data = await res.json();
    return data;
  };

   const handleEmailSignin = async () => {
  try {
    // First: Login Request
    const loginRes = await fetch("http://localhost:5000/api/technicians/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mail: email,
        pass: password
      })
    });

    const loginData = await loginRes.json();
    console.log("Login Response:", loginData);

    
  } catch (error) {
    console.error("Error during email sign-in:", error);
    alert("Something went wrong during sign-in.");
  }
};

  const handleGoogleSignin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await sendTokenToBackend(token);
      onAuth(token);
      localStorage.setItem("role", "user");
      navigate("/dashboard");
    } catch (err) {
      alert("Google Login failed");
=======
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
>>>>>>> 59c4d4bc99c7370dd12ba84142460741d6503aa5
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