import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import "../../App.css";

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

const SignUp = ({ onAuth, onClose, onSwitchToSignin }) => {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Worker fields
  const [name, setName] = useState("");
  const [phno, setPhno] = useState("");
  const [address, setAddress] = useState("");
  const [field, setField] = useState("");
  const [aadharImage, setAadharImage] = useState(null);
  const [aadharImageBase64, setAadharImageBase64] = useState("");
  const [experience, setExperience] = useState("");

  const navigate = useNavigate();

  // Convert image file to base64
  const handleAadharImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("Image size should be less than 5MB");
      return;
    }
    setAadharImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAadharImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSignup = async () => {
    try {
      if (role === "worker") {
        // Register worker in Firebase Auth

        // Register worker in MongoDB
        const formData = new FormData();
        formData.append("name", name);
        formData.append("phno", phno);
        formData.append("mail", email);
        formData.append("pass", password);
        formData.append("address", address);
        formData.append("field", field);
        formData.append("experience", experience);
        formData.append("role", "worker");
        if (aadharImage) formData.append("aadhaarImage", aadharImage);

        const res = await fetch("http://localhost:5000/api/technicians/register", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (res.ok) {
          alert("Registered successfully, you can login once approved by the admin");
          onClose();
          navigate("/");
        } else {
          alert(data.error || "Worker registration failed");
        }
      }
      if(role==="user"){
        console.log("Hello");
      }
    } catch (err) {
      alert("Signup failed");
      console.error(err);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      onAuth(token);
      navigate("/dashboard");
    } catch (err) {
      alert("Google signup failed");
      console.error(err);
    }
  };

  return (
    <div className="auth-modal">
      <button className="close-button" onClick={onClose}>×</button>
      <h3>Join Name.</h3>
      <div className="auth-form">
        <select
          className="auth-select"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="worker">Worker</option>
          <option value="admin">Admin</option>
        </select>

        {role === "user" && (
          <button className="auth-button google" onClick={handleGoogleSignup}>
            <span style={{ marginRight: 8 }}>{GOOGLE_ICON}</span>
            Sign up with Google
          </button>
        )}

        {/* Common fields */}
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

        {/* Worker-specific fields */}
        {role === "worker" && (
          <>
            <input
              className="auth-input"
              type="text"
              placeholder="Name"
              style={{ maxWidth: "100%" }}
              onChange={e => setName(e.target.value)}
            />
            <input
              className="auth-input"
              type="text"
              placeholder="Phone Number"
              style={{ maxWidth: "100%" }}
              onChange={e => setPhno(e.target.value)}
            />
            <input
              className="auth-input"
              type="text"
              placeholder="Address"
              style={{ maxWidth: "100%" }}
              onChange={e => setAddress(e.target.value)}
            />
            <select
              className="auth-input"
              style={{ maxWidth: "100%" }}
              value={field}
              onChange={e => setField(e.target.value)}
            >
              <option value="">Select Field</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Mason">Mason</option>
              <option value="Painter">Painter</option>
              <option value="Other">Other</option>
            </select>
            <input
              className="auth-input"
              type="number"
              min="0"
              placeholder="Experience (years)"
              style={{ maxWidth: "100%" }}
              onChange={e => setExperience(e.target.value)}
            />
            <input
              className="auth-input"
              type="file"
              accept="image/*"
              style={{ maxWidth: "100%" }}
              onChange={handleAadharImageChange}
            />
          </>
        )}

        <button className="auth-button email" onClick={handleSignup}>
          Sign up with Email
        </button>
        <div className="auth-links">
          Already have an account? <a href="#" onClick={e => {e.preventDefault(); onSwitchToSignin();}}>Sign in </a><br/>
        </div>
      </div>
      <div className="auth-terms">
        Click "Sign up" to agree to Medium's <a href="#">Terms of Service</a> and acknowledge that Medium's <a href="#">Privacy Policy</a> applies to you.
      </div>
    </div>
  );
};

export default SignUp;