import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import profileImage from "./assets/profile.png";
import "./css/Note.css";
import { useNavigate } from "react-router-dom";
import Feedback from "./Feedback";
import { auth } from "./firebase";


function Note({ selectedProject, setSelectedProject, updateProject }) {
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

            if (buttonText === "Apply") {
                const response = await fetch(`http://localhost:8000/api/projects/${projectId}/apply/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        position: "Developer",
                        cv: null,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to apply");
                }

                setButtonText("Leave");
                alert("Application submitted!");
            }
            // else {
            //     const response = await fetch(`http://localhost:8000/api/projects/${projectId}/delete`, {
            //         method: "DELETE",
            //         headers: {
            //             "Content-Type": "application/json",
            //             Authorization: `Bearer ${idToken}`,
            //         },
            //     });

            //     if (!response.ok) {
            //         throw new Error("Failed to leave project");
            //     }

            //     alert("You have left the project.");
            //     setButtonText("Apply");
            //     setSelectedProject(null); 

            // }
        } catch (err) {
            console.error("Error handling project application:", err);
            alert("Error processing request.");
        }
    };
    return (
        <>
            {selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={() => setSelectedProject(null)}>
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-fadeIn" onClick={(e) => e.stopPropagation()}>


                        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl" onClick={() => setSelectedProject(null)}>
                            &times;
                        </button>


                        {selectedProject.image && (
                            <img src={selectedProject.image} alt={selectedProject.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                        )}

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProject.name}</h2>
                        <p className="text-gray-600 mb-4">{selectedProject.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-gray-700">
                            <p><span className="font-semibold">Looking For:</span> {selectedProject.looking_for || "Not specified"}</p>
                            <p><span className="font-semibold">Category:</span> {selectedProject.category || "Uncategorized"}</p>
                            <p className="info">
                                <strong>Owner:</strong>{" "}
                                <Link
                                    to={`/profile/${selectedProject.owner}`}
                                    className="text-blue-500 hover:underline"
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
                            <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition" onClick={() => setSelectedProject(null)}>
                                Close
                            </button>
                            <button
                                onClick={() => navigate(`/${selectedProject.id}/apply/`, {
                                    state: { project: selectedProject }
                                })}
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
