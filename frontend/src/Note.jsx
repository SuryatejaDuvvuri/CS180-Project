import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import profileImage from "./assets/profile.png";
import "./css/Note.css";
import { useNavigate } from "react-router-dom";
import Feedback from "./Feedback";
import {auth} from "./firebase";


function Note({ darkMode, toggleDarkMode, selectedProject, setSelectedProject, updateProject }) {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [selectedFeedback, setselectedFeedback] = useState(false);
    const [lastProj, setlastProj] = useState(null);
    const [buttonText, setButtonText] = useState('Apply');
    const [isEditing, setIsEditing] = useState(false);
    const [editedProject, setEditedProject] = useState(selectedProject);
    const [applicants, setApplicants] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [applicantStatuses, setApplicantStatuses] = useState({});
    const navigate = useNavigate();

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


    const handleApply = async () => {
        const user = auth.currentUser;
        if (!user) {
            alert("You need to be logged in.");
            return;
        }
    
        try {
            const idToken = await user.getIdToken();
            const projectId = selectedProject.project_id;
    
            if (buttonText === "Apply") 
                {
                const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/apply/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        // position: "Developer", 
                        // cv: null,
                    }),
                });
    
                if (!response.ok) {
                    throw new Error("Failed to apply");
                }
    
                setButtonText("Leave");
                alert("Application submitted!");
            }  
        } catch (err) {
            console.error("Error handling project application:", err);
            alert("Error processing request.");
        }
    };
    return (
        <>
            {selectedProject && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    onClick={() => setSelectedProject(null)}
                >
                    <div 
                        className={`rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-fadeIn ${
                            darkMode === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button 
                            className={`absolute top-3 right-3 text-xl ${
                                darkMode === "dark" ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                            }`}
                            onClick={() => setSelectedProject(null)}
                        >
                            &times;
                        </button>
        
                        {/* Project Image */}
                        {selectedProject.image && (
                            <img 
                                src={selectedProject.image} 
                                alt={selectedProject.name} 
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                        )}
        
                        {/* Project Details */}
                        <h2 className="text-2xl font-bold mb-2">{selectedProject.name}</h2>
                        <p className={`mb-4 ${darkMode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                            {selectedProject.description}
                        </p>
        
                        <div className={`grid grid-cols-2 gap-4 ${darkMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                            <p><span className="font-semibold">Looking For:</span> {selectedProject.looking_for || "Not specified"}</p>
                            <p><span className="font-semibold">Category:</span> {selectedProject.category || "Uncategorized"}</p>
                            <p className="info">
                                <strong>Owner:</strong>{" "}
                                <Link 
                                    to={`/${selectedProject.owner}/profile/`} 
                                    className="text-blue-400 hover:underline"
                                >
                                    {selectedProject.owner}
                                </Link>
                            </p>
                            <p><span className="font-semibold">Team Size:</span> {selectedProject.number_of_people || "N/A"}</p>
                            <p><span className="font-semibold">Weekly Hours:</span> {selectedProject.weekly_hours || "N/A"} hrs</p>
                            <p><span className="font-semibold">Start Date:</span> {selectedProject.start_date ? new Date(selectedProject.start_date).toDateString() : "N/A"}</p>
                            <p><span className="font-semibold">End Date:</span> {selectedProject.end_date ? new Date(selectedProject.end_date).toDateString() : "N/A"}</p>
                        </div>
        
                        {/* Buttons */}
                        <div className="mt-6 flex justify-between">
                            <button 
                                className={`px-4 py-2 rounded-lg transition ${
                                    darkMode === "dark" 
                                        ? "bg-gray-700 text-white hover:bg-gray-600"
                                        : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                                }`}
                                onClick={() => setSelectedProject(null)}
                            >
                                Close
                            </button>
                            
                            <button 
                                onClick={() => navigate(`/${selectedProject.id}/apply/`, {
                                    state: { project: selectedProject }
                                })}
                                className={`px-4 py-2 rounded-lg transition ${
                                    darkMode === "dark" 
                                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                        : "bg-blue-500 hover:bg-blue-600 text-white"
                                }`}
                            >
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Note;
