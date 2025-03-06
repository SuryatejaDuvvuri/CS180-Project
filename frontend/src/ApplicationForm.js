import React, { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "./firebase.js";
import './ApplicationForm.css';
import './css/Colors.css';

const ApplicationForm = () => {
    const location = useLocation();
    const project = location.state?.project;
    const navigate = useNavigate();

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

            const response = await fetch(`http://localhost:8000/api/projects/${projectId}/apply/`, {
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
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold">Apply for {project?.name}</h1>
            <form onSubmit={handleApply} className="mt-4">
                {/* Full Name */}
                <label className="block mb-2">Full Name:</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`border p-2 w-full rounded ${formData.name === '' ? 'border-red-500' : ''}`}
                    required
                />
                {formData.name === '' && <p className="text-red-500">Required</p>}

                {/* Email */}
                <label className="block mt-4 mb-2">Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`border p-2 w-full rounded ${formData.email === '' ? 'border-red-500' : ''}`}
                    required
                />
                {formData.email === '' && <p className="text-red-500">Required</p>}

                {/* Position */}
                <label className="block mt-4 mb-2">Position:</label>
                <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className={`border p-2 w-full rounded ${formData.position === '' ? 'border-red-500' : ''}`}
                    required
                />
                {formData.position === '' && <p className="text-red-500">Required</p>}

                {/* Resume Upload */}
                <label className="block mt-4 mb-2">Upload CV (Optional):</label>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeChange}
                    className="border p-2 w-full rounded"
                />
                {!resumeChanged && <p className="text-red-500">File required</p>}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Submit Application"}
                </button>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
};

export default ApplicationForm;