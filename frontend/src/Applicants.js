import React, {useState, useEffect} from 'react';
import Email from './Email.js';
import { auth } from './firebase.js';
import { useNavigate, useParams } from 'react-router-dom'
import Header from './Header.js';
function Applicants({darkMode, toggleDarkMode, handleMajorChange})
{
    
    const [applicants, setApplicants] = useState([]);
    const {email, projectId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
   
    useEffect(() => {

        const fetchCurrentUser = async () => {
            const user = auth.currentUser;
            if (user) {
                setUserEmail(user.email);
            }
        };
        fetchCurrentUser();
    }, []);
    useEffect(() => {
        const fetchApplicants = async () => {
            
            if (!email || !projectId) return;

            setLoading(true);
            try {
                const user = auth.currentUser;
                if (!user) {
                    console.error("No authenticated user.");
                    return;
                }

                const idToken = await user.getIdToken();
                const response = await fetch(`${API_BASE_URL}/api/users/${email}/projects/${projectId}/applicants/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch applicants.");
                }

                const data = await response.json();

                setApplicants(data.applicants || []);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching applicants:", err);
                setApplicants([]);
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants(); 
    }, [email, projectId]); 

    const handleEmail = async (applicantEmail, newStatus,applicantName) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error("User not authenticated.");
                return;
            }

            const idToken = await user.getIdToken();

            const response = await fetch(
                `${API_BASE_URL}/api/projects/${projectId}/applicants/${applicantEmail}/`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to reject applicant.");
            }

            if (newStatus === "Rejected") {
                setApplicants((prevApplicants) =>
                    prevApplicants.filter((applicant) => applicant.email !== email)
                );
            }

            alert("Email has been sent successfully!");
        } catch (error) {
            console.error("Error rejecting applicant:", error);
            alert("Failed to reject applicant.");
        }
    }

    if (userEmail !== email) 
    {
        return <p className="text-center text-red-500">Access denied. You are not the owner of this project.</p>;
    }

    return (
        <div className={`${darkMode === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen p-5`}>
            <h1 className="text-3xl font-bold text-center mb-5">Applicants for Project</h1>
        
        
            {error && <p className="text-red-500 text-center">{error}</p>}
        
        
            <div className="overflow-x-auto">
                <table className={`min-w-full shadow-md rounded-lg overflow-hidden 
                                ${darkMode === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
                    <thead>
                        <tr className={`${darkMode === "dark" ? "bg-gray-700" : "bg-blue-500 text-white"}`}>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Position</th>
                            <th className="px-6 py-3">CV</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(applicants) && applicants.length > 0 ? (
                            applicants.filter(applicant => applicant.id !== "init").map((applicant, index) => (
                                <tr key={applicant.email || `fallback-key-${index}`} className={`${darkMode === "dark" ? "border-gray-700" : "border-gray-300"} border-t`}>
                                    <td className={`px-6 py-3`}>
                                        <a href={`/profile/${applicant.email}`} className={`${darkMode === "dark" ? "text-white" : "text-black"} hover:underline`}>
                                            {applicant.fullname}
                                        </a>
                                    </td>
                                    <td className="px-6 py-3">{applicant.email}</td>
                                    <td className="px-6 py-3">{applicant.position}</td>
                                    <td className="px-6 py-3">
                                        {applicant.resume ? (
                                            <a href={`${applicant.resume}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline"
                                            download={`${applicant.fullname}'s CV.pdf`}>
                                                View CV
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">No CV uploaded</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 flex space-x-2">
                                        <button
                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                                            onClick={() => handleEmail(applicant.email, "Accepted", applicant.fullname)}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                            onClick={() => handleEmail(applicant.email, "Rejected", applicant.fullname)}
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-lg text-gray-400">
                                    No applicants available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
    </div>
    );
}

export default Applicants;