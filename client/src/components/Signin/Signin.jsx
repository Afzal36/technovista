import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import "./Signin.css";

const GOOGLE_ICON = (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <g>
      <path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.25 3.22l6.91-6.91C36.18 2.34 30.45 0 24 0 14.61 0 6.27 5.7 2.13 14.02l8.51 6.62C12.83 13.13 17.97 9.5 24 9.5z"/>
      <path fill="#34A853" d="M46.1 24.5c0-1.54-.14-3.02-.39-4.45H24v8.44h12.44c-.54 2.9-2.17 5.36-4.62 7.02l7.19 5.59C43.73 37.13 46.1 31.29 46.1 24.5z"/>
      <path fill="#FBBC05" d="M10.64 28.64c-1.09-3.21-1.09-6.68 0-9.89l-8.51-6.62C.44 16.61 0 20.22 0 24c0 3.78.44 7.39 2.13 10.87l8.51-6.62z"/>
      <path fill="#EA4335" d="M24 48c6.45 0 12.18-2.13 16.69-5.81l-7.19-5.59c-2.01 1.35-4.59 2.16-7.5 2.16-6.03 0-11.17-3.63-13.36-8.87l-8.51 6.62C6.27 42.3 14.61 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </g>
  </svg>
);

const Signin = ({ onAuth, onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCred.user.getIdToken();
      await sendTokenToBackend(token);
      onAuth(token);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  const handleGoogleSignin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await sendTokenToBackend(token);
      onAuth(token);
      navigate("/dashboard");
    } catch (err) {
      alert("Google Login failed");
    }
  };

  return (
    <div className="auth-modal">
      <button className="close-button" onClick={onClose}>×</button>
      <h3>Welcome back.</h3>
      <div className="auth-form">
        <button className="auth-button" onClick={handleGoogleSignin}>
          <span style={{ marginBottom: 4 }}>{GOOGLE_ICON}</span>
          Sign in with Google
        </button>
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
        No account? <a href="#" onClick={e => {e.preventDefault(); onSwitchToSignup();}}>Create one</a><br/>
      </div>
      <div className="auth-terms">
        Click "Sign in" to agree to Application's <a href="#">Terms of Service</a> and acknowledge that Application's <a href="#">Privacy Policy</a> applies to you.
      </div>
    </div>
  );
};

export default Signin;