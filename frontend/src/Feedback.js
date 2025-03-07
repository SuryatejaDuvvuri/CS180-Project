import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { useParams } from "react-router-dom";
import Header from './Header';
function Feedback({theme,toggleTheme}) {
    const { projectId } = useParams();
    const [feedbacks, setFeedbacks] = useState([]);
    const [experience, setExperience] = useState("");
    const [improvements, setImprovements] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (!user) {
                setError("You must be logged in.");
                setLoading(false);
                return;
            }

            setUserEmail(user.email);
            const idToken = await user.getIdToken();

            try {
                // Fetch project details to check if the user is the owner
                const projectResponse = await fetch(
                    `http://localhost:8000/api/projects/${projectId}/`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    }
                );

                if (!projectResponse.ok) {
                    throw new Error("Project not found.");
                }

                const projectData = await projectResponse.json();

                // Check if user is the project owner
                if (projectData.owner === user.email) {
                    setIsOwner(true);
                } else {
                    setIsOwner(false);
                }

                // Check if the user is a member of the project
                const memberResponse = await fetch(
                    `http://localhost:8000/api/users/${user.email}/projects/`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    }
                );

                if (memberResponse.ok) {
                    setIsMember(true);
                } else {
                    setIsMember(false);
                }

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [projectId]);

    useEffect(() => {
        if (isOwner) {
            const fetchFeedbacks = async () => {
                setLoading(true);
                try {
                    const idToken = await auth.currentUser.getIdToken();

                    const response = await fetch(
                        `http://localhost:8000/api/projects/${projectId}/feedback/`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${idToken}`,
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Failed to fetch feedback.");
                    }

                    const data = await response.json();
                    setFeedbacks(data.feedback);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchFeedbacks();
        }
    }, [isOwner, projectId]);

    // const fetchFeedback = async () => {
    //     try {
    //         setLoading(true);
    //         const user = auth.currentUser;
    //         if (!user) {
    //             console.error("User not authenticated.");
    //             return;
    //         }
    
    //         const idToken = await user.getIdToken();
    //         const response = await fetch(
    //             `http://localhost:8000/api/projects/${projectId}/feedback/`, 
    //             {
    //                 method: "GET",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${idToken}`,  
    //                 },
    //             }
    //         );
    //         if (!response.ok) {
    //             throw new Error("Failed to fetch feedback.");
    //         }
    //         const data = await response.json();
    //         if (data.owner === user.email) 
    //         {
    //             setIsOwner(false);  
    //         } 
    //         else 
    //         {
    //             setFeedbacks(data.feedback || []);
    //             setIsOwner(true); 
    //         }
    //         setFeedbacks(data.feedback || []);
    //     } catch (err) {
    //         console.error("Error fetching feedback:", err);
    //         setError(err.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!experience || !improvements) {
            alert("Please fill in both experience and improvement fields.");
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                alert("You must be logged in to submit feedback.");
                return;
            }

            const idToken = await user.getIdToken();
            console.log(projectId);
            const response = await fetch(`http://localhost:8000/api/projects/${projectId}/feedback/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    email: user.email,
                    experience,
                    improvements,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit feedback.");
            }

            alert("Feedback submitted successfully!");
            setExperience("");
            setImprovements("");
            fetchFeedback();
        } catch (err) {
            console.error("Error submitting feedback:", err);
            alert("Error submitting feedback. Please try again.");
        }
    };

    return (
        <div>

            {isMember && !isOwner && (
                <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-center mb-4">Project Feedback</h2>
    
                    <form onSubmit={handleSubmit} className="mb-6">
                        <label className="block mb-2 font-medium">Your Experience</label>
                        <textarea
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            rows="3"
                            placeholder="Describe your experience..."
                            required
                        ></textarea>
    
                        <label className="block mt-4 mb-2 font-medium">Suggestions for Improvement</label>
                        <textarea
                            value={improvements}
                            onChange={(e) => setImprovements(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            rows="3"
                            placeholder="What can be improved?"
                            required
                        ></textarea>
    
                        <button
                            type="submit"
                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full transition"
                        >
                            Submit Feedback
                        </button>
                    </form>
                </div>
            )}

            {isOwner && (
                <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
                    <h3 className="text-2xl font-semibold text-center mb-4">Member Feedback</h3>
    
                    {loading ? (
                        <p className="text-center text-gray-500">Loading feedback...</p>
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : feedbacks.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="px-4 py-2 border">Name</th>
                                        <th className="px-4 py-2 border">Email</th>
                                        <th className="px-4 py-2 border">Experience</th>
                                        <th className="px-4 py-2 border">Improvements</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feedbacks.map((fb, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="px-4 py-2 border">{fb.name || "Anonymous"}</td>
                                            <td className="px-4 py-2 border">{fb.email}</td>
                                            <td className="px-4 py-2 border">{fb.experience}</td>
                                            <td className="px-4 py-2 border">{fb.improvements}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No feedback yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Feedback;