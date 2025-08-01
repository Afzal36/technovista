import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ...existing imports...
const SignUp = ({ onAuth, onClose, onSwitchToSignin }) => {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Worker fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [field, setField] = useState("");
  const [aadharImage, setAadharImage] = useState("");
  const [experience, setExperience] = useState("");

  const navigate = useNavigate();

  const handleAadharImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAadharImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSignup = async () => {
    try {
      const body = {
        email,
        password,
        name,
        phone,
        role,
        ...(role === "worker" && {
          address,
          field,
          aadhaarImage: aadharImage,
          experience
        })
      };
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registration successful! Please sign in.");
        onClose();
        navigate("/");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  };

  return (
    <div className="auth-modal">
      <button className="close-button" onClick={onClose}>×</button>
      <h3>Sign Up</h3>
      <div className="auth-form">
        <select className="auth-select" value={role} onChange={e => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="worker">Worker</option>
          <option value="admin">Admin</option>
        </select>
        <input className="auth-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <input className="auth-input" type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="auth-input" type="text" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
        {role === "worker" && (
          <>
            <input className="auth-input" type="text" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
            <select className="auth-input" value={field} onChange={e => setField(e.target.value)}>
              <option value="">Select Field</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Mason">Mason</option>
              <option value="Painter">Painter</option>
              <option value="Other">Other</option>
            </select>
            <input className="auth-input" type="number" min="0" placeholder="Experience (years)" value={experience} onChange={e => setExperience(e.target.value)} />
            <label style={{ margin: "8px 0 4px 0" }}>Aadhaar Image:</label>
            <input className="auth-input" type="file" accept="image/*" onChange={handleAadharImageChange} />
            {aadharImage && (
              <img src={aadharImage} alt="Aadhaar Preview" style={{ width: 120, marginTop: 8, borderRadius: 6, border: "1px solid #ccc" }} />
            )}
          </>
        )}
        <button className="auth-button email" onClick={handleSignup}>Sign up with Email</button>
        <div className="auth-links">
          Already have an account? <a href="#" onClick={e => {e.preventDefault(); onSwitchToSignin();}}>Sign in </a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;