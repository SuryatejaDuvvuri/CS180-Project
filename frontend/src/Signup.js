import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmail } from "./firebase";
import { FaGithub, FaLinkedin } from "react-icons/fa";

function Signup({darkMode, toggleDarkMode}) {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate(); 
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        netId: '',
        skills: '',
        pronouns: '',
        resumeFile: null,
        github: '',
        linkedin: '',
        interests: '',
        experience: '',
        location: '',
        weeklyHours: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setFormData({ ...formData, resumeFile: reader.result });
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const userData = {
            fullname: formData.name,
            email: formData.email,
            net_id: formData.netId,
            resume: formData.resumeFile,
            github: formData.github,
            linkedin: formData.linkedin,
            skills: formData.skills.split(","),
            pronouns: formData.pronouns,
            interests: formData.interests.split(","),
            experience: formData.experience,
            location: formData.location,
            weekly_hours: parseInt(formData.weeklyHours, 10),
            password: formData.password,
        };

        try {
            const idToken = await signUpWithEmail(formData.email, formData.password);
            if (!idToken) throw new Error("Failed to register user in Firebase");

            const response = await fetch(`${API_BASE_URL}/api/users/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                alert("Account created successfully");
                navigate("/home");
            } else {
                const data = await response.json();
                alert(data.error || "Failed to create account");
            }
        } catch (err) {
            alert("Failed to create account");
            console.error("Error:", err);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${darkMode === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
            <div className={`shadow-lg rounded-lg p-8 w-full max-w-3xl ${darkMode === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
                <h1 className={`text-3xl font-bold text-center mb-6 ${darkMode === "dark" ? "text-white" : "text-black"}`}>Create an Account</h1>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <label className={`block font-semibold ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`} required />
                </div>


                <div>
                    <label className={`block font-semibold ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`} required />
                </div>


                <div>
                    <label className={`block font-semibold ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>NetID</label>
                    <input type="text" name="netId" value={formData.netId} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`} required />
                </div>


                <div>
                    <label className={`block font-semibold ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>Skills</label>
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`} required />
                </div>


                <div>
                    <label className={`block font-semibold ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>Pronouns</label>
                    <input type="text" name="pronouns" value={formData.pronouns} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`} required />
                </div>


                <div>
                    <label className={`block font-semibold ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>Resume (PDF only)</label>
                    <input type="file" accept=".pdf" onChange={handleFileUpload} className="w-full p-2 border rounded-lg" />
                </div>


                <div className="flex gap-4">
                    <div className="flex items-center w-1/2">
                    <FaGithub className={`mr-2 ${darkMode === "dark" ? "text-white" : "text-gray-700"}`} size={24} />
                    <input type="url" name="github" value={formData.github} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`} placeholder="GitHub Profile" />
                    </div>

                    <div className="flex items-center w-1/2">
                    <FaLinkedin className="mr-2 text-blue-600" size={24} />
                    <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`} placeholder="LinkedIn Profile" />
                    </div>
                </div>


                <div>
                    <label className={`block font-semibold ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>Interests</label>
                    <input type="text" name="interests" value={formData.interests} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`} required />
                </div>

 
                <div>
                    <label className={`block font-semibold ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>Experience</label>
                    <input type="text" name="experience" value={formData.experience} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`} required />
                </div>


                <div>
                    <label className={`block font-semibold ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`} required />
                </div>


                <div>
                    <label className={`block font-semibold ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>Weekly Time Commitment (hours)</label>
                    <input type="number" name="weeklyHours" value={formData.weeklyHours} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`} required />
                </div>


                <div>
                    <label className={`block font-semibold ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`} required />
                </div>


                <div>
                    <label className={`block font-semibold ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>Confirm Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`w-full p-2 border rounded-lg ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`} required />
                </div>


                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg mt-4 transition">
                    Sign Up
                </button>
                </form>
            </div>
            </div>
    );
}

export default Signup;