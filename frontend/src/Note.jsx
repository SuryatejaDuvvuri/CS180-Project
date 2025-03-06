import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import profileImage from "./assets/profile.png";
import "./css/Note.css";
import Feedback from "./Feedback";


function Note({ selectedProject, setSelectedProject, updateProject }) {
    const [selectedFeedback, setselectedFeedback] = useState(false);
    const [lastProj, setlastProj] = useState(null);
    const [buttonText, setButtonText] = useState('Apply');
    const [isEditing, setIsEditing] = useState(false);
    const [editedProject, setEditedProject] = useState(selectedProject);
    const [applicants, setApplicants] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [applicantStatuses, setApplicantStatuses] = useState({});

    useEffect(() => {
        if (selectedProject) {
            const dummyApplicants = [
                { name: selectedProject.name || "Unknown", status: "Owner", position: "Backend Dev" },
                { name: "Matt", status: "Approved", position: "Frontend Dev" },
                { name: "Jane Smith", status: "Rejected", position: "UI Designer" },
            ];
            setApplicants(dummyApplicants);
        }
    }, [selectedProject]);


    const toggleEdit = () => {
        if (isEditing) {
            updateProject(editedProject);
        }
        setIsEditing(!isEditing);
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProject((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle Apply Button Toggle
    const handleApply = () => {
        setButtonText((prev) => (prev === "Apply" ? "Leave" : "Apply"));
    };

    return (
        <>
            {selectedProject && (
                <div className="project-detail-overlay">
                    <div className="project-detail-box" onClick={(e) => e.stopPropagation()}>
                        <h2 className="title">
                            {isEditing ? (
                                <input type="text" name="title" value={editedProject.title} onChange={handleInputChange} />
                            ) : (
                                selectedProject.title
                            )}
                        </h2>
                        <div className="content">
                            <img className="image" src={profileImage} alt="Profile" />
                            <div className="info">
                                <p className="info"><strong>Name:</strong> {isEditing ? (
                                    <input type="text" name="name" value={editedProject.name} onChange={handleInputChange} />
                                ) : (
                                    selectedProject.name
                                )}
                                </p>

                                <p className="info"><strong>Description:</strong> {isEditing ? (
                                    <textarea name="description" value={editedProject.description} onChange={handleInputChange} />
                                ) : (
                                    selectedProject.description
                                )}
                                </p>

                                <p className="info"><strong>Looking for:</strong> {isEditing ? (
                                    <input type="text" name="looking_for" value={editedProject.looking_for} onChange={handleInputChange} />
                                ) : (
                                    selectedProject.looking_for
                                )}
                                </p>

                                <p className="info"><strong>Skills required:</strong> {isEditing ? (
                                    <input type="text" name="skills_required" value={editedProject.skills_required.join(", ")}
                                        onChange={(e) => setEditedProject((prev) => ({
                                            ...prev, skills_required: e.target.value.split(", "),
                                        }))}
                                    />
                                ) : (
                                    selectedProject.skills_required.join(", ")
                                )}
                                </p>
                            </div>
                        </div>

                        <div className="button-container">
                            <button onClick={() => setSelectedProject(null)}>Close</button>
                            <button onClick={() => setselectedFeedback(true)}>Feedback</button>
                            <button onClick={handleApply}>{buttonText}</button>
                        </div>
                    </div>

                    <div className="Project-Manager">
                        <h2>Project Manager</h2>
                        <div className="applicants">
                            <h1><u>Applicants</u></h1>
                            {applicants.map((app, index) => (
                                <li key={index}>{app.name}</li>
                            ))}
                        </div>
                        <div className="status">
                            <h1><u>Status</u></h1>
                            {applicants.map((app, index) => (
                                <select key={index} value={applicantStatuses[app.name] || ""} onChange={(e) => setApplicantStatuses(prev => ({ ...prev, [app.name]: e.target.value }))}>
                                    <option value="">Select</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Note;
