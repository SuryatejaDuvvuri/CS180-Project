import React, { useState } from 'react';
import './ApplicationForm.css';
import { useLocation, useNavigate } from "react-router-dom";
import {auth} from "./firebase.js"

const ApplicationForm = () => {
    const location = useLocation();
    const project = location.state?.project;
    const navigate = useNavigate();
    const [applicantName, setApplicantName] = useState("");
    const [position, setPosition] = useState("");
    const [resume, setResume] = useState(null);
    const [error, setError] = useState(null);
    const [loading,setLoading] = useState(false);

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

            if (resume) {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(resume);
                await new Promise((resolve) => {
                    fileReader.onloadend = () => {
                        resumeBase64 = fileReader.result;
                        resolve();
                    };
                });
            }  
            const owner_email = project.owner_email || project.owner;
            console.log(owner_id);
            const projectId = project.project_id || project.id;
            const response = await fetch(`http://localhost:8000/api/projects/${project.id}/apply/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    project_id: projectId,
                    owner_email: owner_email,
                    position,
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
                <label className="block mb-2">Full Name:</label>
                <input 
                    type="text" 
                    value={applicantName} 
                    onChange={(e) => setApplicantName(e.target.value)} 
                    className="border p-2 w-full rounded" 
                    required
                />

                <label className="block mt-4 mb-2">Position:</label>
                <input 
                    type="text" 
                    value={position} 
                    onChange={(e) => setPosition(e.target.value)} 
                    className="border p-2 w-full rounded" 
                    required
                />

                <label className="block mt-4 mb-2">Upload CV (Optional):</label>
                <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => setResume(e.target.files[0])} 
                    className="border p-2 w-full rounded" 
                />

                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
                    Submit Application
                </button>
            </form>
        </div>
    );
};

export default ApplicationForm;