
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
  const [experience, setExperience] = useState("");

  const navigate = useNavigate();

  const sendTokenToBackend = async (token, selectedRole, workerData = {}) => {
    const res = await fetch("http://localhost:5000/auth", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role: selectedRole, ...workerData })
    });
    const data = await res.json();
    return data;
  };

  const handleSignup = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCred.user.getIdToken();
      let workerData = {};
      if (role === "worker") {
        // You may want to handle image upload separately and send the URL/path
        workerData = {
          name,
          phno,
          mail: email,
          pass: password,
          address,
          field,
          experience,
          aadharImage // send as base64 or handle upload separately
        };
      }
      const data = await sendTokenToBackend(token, role, workerData);
      onAuth(token);
      if (data.user && data.user.role) {
        navigate("/dashboard");
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
      const data = await sendTokenToBackend(token, role);
      onAuth(token);
      if (data.user && data.user.role) {
        navigate("/dashboard");
      }
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
      <option value="electrician">Electrician</option>
      <option value="plumber">Plumber</option>
      <option value="carpenter">Carpenter</option>
      <option value="painter">Painter</option>
      <option value="gardener">Gardener</option>
      <option value="mechanic">Mechanic</option>
      <option value="driver">Driver</option>
      <option value="cook">Cook</option>
      <option value="cleaner">Cleaner</option>
      <option value="other">Other</option>
    </select>
    <input
      className="auth-input"
      type="number"
      placeholder="Experience (years)"
      style={{ maxWidth: "100%" }}
      onChange={e => setExperience(e.target.value)}
    />
    <input
      className="auth-input"
      type="file"
      accept="image/*"
      style={{ maxWidth: "100%" }}
      onChange={e => setAadharImage(e.target.files[0])}
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