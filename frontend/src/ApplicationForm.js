import React, { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "./firebase.js";
import './ApplicationForm.css';
import './css/Colors.css';

const ApplicationForm = ({darkMode, toggleDarkMode}) => {
    const location = useLocation();
    const project = location.state?.project;
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        position: '',
        resume: '',
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resumeChanged, setResumeChanged] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleResumeChange = (e) => {
        setFormData({ ...formData, resume: e.target.files[0] });
        setResumeChanged(true);
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const user = auth.currentUser;
        if (!user) {
            setError("You must be logged in to apply.");
            setLoading(false);
            return;
        }

        try {
            const idToken = await user.getIdToken();
            let resumeBase64 = null;

            if (formData.resume) {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(formData.resume);
                await new Promise((resolve) => {
                    fileReader.onloadend = () => {
                        resumeBase64 = fileReader.result;
                        resolve();
                    };
                });
            }

            const owner_email = project.owner_email || project.owner;
            const projectId = project.project_id || project.id;

            const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/apply/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    project_id: projectId,
                    owner_email: owner_email,
                    position: formData.position,
                    resume: resumeBase64,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to apply.");
            }

            alert("Application submitted successfully!");
            navigate("/home");
        } catch (err) {
            setError(err.message);
            console.error("Error submitting application:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${darkMode === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen flex justify-center items-center`}>
        <div className="container mx-auto p-6 max-w-lg bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold text-center mb-4">Apply for {project?.name}</h1>
            <form onSubmit={handleApply} className="space-y-4">

                <div>
                    <label className="block font-medium">Full Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`border p-2 w-full rounded-md focus:ring focus:ring-blue-400 focus:outline-none ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"} ${formData.name === '' ? 'border-red-500' : ''}`}
                        required
                    />
                    {formData.name === '' && <p className="text-red-500 text-sm mt-1">Full Name is required.</p>}
                </div>
    

                <div>
                    <label className="block font-medium">Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`border p-2 w-full rounded-md focus:ring focus:ring-blue-400 focus:outline-none ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"} ${formData.email === '' ? 'border-red-500' : ''}`}
                        required
                    />
                    {formData.email === '' && <p className="text-red-500 text-sm mt-1">Email is required.</p>}
                </div>
    
                <div>
                    <label className="block font-medium">Position:</label>
                    <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        
                        className={`border p-2 w-full rounded-md focus:ring focus:ring-blue-400 focus:outline-none ${darkMode === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"} ${formData.position === '' ? 'border-red-500' : ''}`}
                        required
                    />
                    {formData.position === '' && <p className="text-red-500 text-sm mt-1">Position is required.</p>}
                </div>
    

                <div>
                    <label className="block font-medium">Upload CV (Optional):</label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleResumeChange}
                        className="border p-2 w-full rounded-md"
                    />
                    {!resumeChanged && <p className="text-red-500 text-sm mt-1">Please upload a file if required.</p>}
                </div>
    
 
                <button
                    type="submit"
                    className={`w-full px-4 py-2 rounded-md font-semibold transition ${
                        loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                    } text-white`}
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Submit Application"}
                </button>
    
            </form>
    

            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
    </div>
    );
};

export default ApplicationForm;