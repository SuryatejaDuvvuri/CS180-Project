
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpWithEmail } from "../firebase";
import "./Signup.css";

function Signup() {
  const [name, setName] = useState("");
  const [netId, setNetId] = useState("");
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const idToken = await signUpWithEmail(email, password);
      if (!idToken) throw new Error("Failed to register user in Firebase");

      const response = await fetch("http://127.0.0.1:8000/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          netId,
          skills: skills.split(",").map(skill => skill.trim()),
          interests: interests.split(",").map(interest => interest.trim()),
          experience,
          location,
          weeklyHours,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      alert("Signup successful! You can now log in.");
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup">
      <h1>Create an Account</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSignup} className="signup-form">
        <label>Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>Full Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>NetID:
          <input type="text" value={netId} onChange={(e) => setNetId(e.target.value)} required />
        </label>
        <label>Skills (comma-separated):
          <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} required />
        </label>
        <label>Interests (comma-separated):
          <input type="text" value={interests} onChange={(e) => setInterests(e.target.value)} required />
        </label>
        <label>Experience:
          <input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} required />
        </label>
        <label>Location:
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </label>
        <label>Weekly Time Commitment (hours):
          <input type="number" value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} required />
        </label>
        <label>Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label>Confirm Password:
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </label>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
