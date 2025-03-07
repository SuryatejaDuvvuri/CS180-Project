import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmail } from "./firebase";
import { FaGithub, FaLinkedin } from "react-icons/fa";

function Signup() {
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

            const response = await fetch("http://localhost:8000/api/users/", {
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
                <h1 className="text-3xl font-bold text-center mb-6">Create an Account</h1>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label htmlFor="name" className="block text-gray-700 font-semibold">Full Name</label>
                        <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-gray-700 font-semibold">Email</label>
                        <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>

                    {/* NetID */}
                    <div>
                        <label htmlFor="netId" className="block text-gray-700 font-semibold">NetID</label>
                        <input id="netId" type="text" name="netId" value={formData.netId} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>

                    {/* Skills */}
                    <div>
                        <label htmlFor="skills" className="block text-gray-700 font-semibold">Skills</label>
                        <input id="skills" type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>

                    {/* Pronouns */}
                    <div>
                        <label htmlFor="pronouns" className="block text-gray-700 font-semibold">Pronouns</label>
                        <input id="pronouns" type="text" name="pronouns" value={formData.pronouns} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>

                    {/* Resume Upload */}
                    <div>
                        <label htmlFor="resume" className="block text-gray-700 font-semibold">Resume (PDF only)</label>
                        <input id="resume" type="file" accept=".pdf" onChange={handleFileUpload} className="w-full p-2 border rounded-lg" />
                    </div>

                    {/* GitHub & LinkedIn */}
                    <div className="flex gap-4">
                        <div className="flex items-center w-1/2">
                            <FaGithub className="mr-2 text-gray-700" size={24} />
                            <input id="github" type="url" name="github" value={formData.github} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="GitHub Profile" />
                        </div>

                        <div className="flex items-center w-1/2">
                            <FaLinkedin className="mr-2 text-blue-600" size={24} />
                            <input id="linkedin" type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="LinkedIn Profile" />
                        </div>
                    </div>

                    {/* Interests */}
                    <div>
                        <label htmlFor="interests" className="block text-gray-700 font-semibold">Interests</label>
                        <input id="interests" type="text" name="interests" value={formData.interests} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>

                    {/* Experience */}
                    <div>
                        <label htmlFor="experience" className="block text-gray-700 font-semibold">Experience</label>
                        <input id="experience" type="text" name="experience" value={formData.experience} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-gray-700 font-semibold">Location</label>
                        <input id="location" type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>

                    {/* Weekly Time Commitment */}
                    <div>
                        <label htmlFor="weeklyHours" className="block text-gray-700 font-semibold">Weekly Time Commitment (hours)</label>
                        <input id="weeklyHours" type="number" name="weeklyHours" value={formData.weeklyHours} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-gray-700 font-semibold">Password</label>
                        <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold">Confirm Password</label>
                        <input id="confirmPassword" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg mt-4">
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Signup;
