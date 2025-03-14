import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signInWithGoogle, signInWithEmail } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login({darkMode, toggleDarkMode}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      const idToken = await signInWithEmail(email, password);
      
      const response = await fetch(`${API_BASE_URL}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, idToken }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if(idToken)
      {
        localStorage.setItem("authToken", idToken);
      }
      navigate("/home");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
        const idToken = await signInWithGoogle();
        if (!idToken) {
            throw new Error("Failed to retrieve Firebase ID token.");
        }

        const response = await fetch(`${API_BASE_URL}/api/google-login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
        });

        const data = await response.json();

        if (response.status === 302) 
        {
            navigate("/signup");
            return;
        }

        if (!response.ok) 
        {
            throw new Error(data.error || "Google Login failed");
        }

        localStorage.setItem("authToken", data.token);
        navigate("/home");
    } catch (err) {
        setError(err.message);
    }
};

  return (
    <div className={`w-screen h-screen flex justify-center items-center ${darkMode === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
  <div className={`p-8 rounded-lg shadow-md w-96 ${darkMode === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
    <h2 className={`text-2xl font-bold text-center mb-4 ${darkMode === "dark" ? "text-white" : "text-black"}`}>Login</h2>
    {error && <p className="text-red-500 text-center">{error}</p>}

    <form onSubmit={handleLogin}>
      <div className="mb-4">
        <label className={`block text-sm font-medium ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>Email</label>
        <input
          type="email"
          className={`mt-1 block w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className={`block text-sm font-medium ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>Password</label>
        <input
          type="password"
          className={`mt-1 block w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition"
      >
        Login
      </button>
    </form>

    {/* <button
      onClick={handleGoogleLogin}
      className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition"
    >
      Sign in with Google
    </button> */}

    <button
      onClick={() => navigate("/signup")}
      className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition"
    >
      Sign Up
    </button>
  </div>
</div>
  );
}