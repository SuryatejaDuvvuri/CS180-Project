import React, { useState, useEffect } from 'react';
import Email from './Email.js';
import { auth } from './firebase';
import { useNavigate, useParams } from 'react-router-dom'

function Applicants() {
    const [applicants, setApplicants] = useState([]);
    const { email, projectId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const navigate = useNavigate();

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
                const response = await fetch(`http://localhost:8000/api/users/${email}/projects/${projectId}/applicants/`, {
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
                console.log(data);
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

    const handleEmail = async (applicantEmail, newStatus, applicantName) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error("User not authenticated.");
                return;
            }

            const idToken = await user.getIdToken();

            const response = await fetch(
                `http://localhost:8000/api/projects/${projectId}/applicants/${applicantEmail}/`,
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
        } catch (error) {
            console.error("Error rejecting applicant:", error);
            alert("Failed to reject applicant.");
        }
    }

    if (userEmail !== email) {
        return <p className="text-center text-red-500">Access denied. You are not the owner of this project.</p>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-5">
            <h1 className="text-3xl font-bold text-center mb-5">Applicants for Project</h1>

            {error && <p className="text-red-500">{error}</p>}

            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-blue-500 text-white">
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Position</th>
                        <th className="px-4 py-2">CV</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {applicants.length > 0 ? (
                        applicants.filter(applicant => applicant.id !== "init").map((applicant, index) => (
                            <tr key={applicant.email || `fallback-key-${index}`} className="border-t">
                                <td className="px-4 py-2">
                                    <a
                                        href={`/profile/${applicant.email}`}
                                        className="text-blue-500 hover:underline"
                                    >
                                        {applicant.fullname}
                                    </a>
                                </td>
                                <td className="px-4 py-2">{applicant.email}</td>
                                <td className="px-4 py-2">{applicant.position}</td>
                                <td className="px-4 py-2">
                                    {applicant.resume ? (
                                        <a
                                            href={applicant.resume}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            View CV
                                        </a>
                                    ) : (
                                        'No CV uploaded'
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        className="bg-green-500 text-white px-3 py-1 rounded"
                                        onClick={() => handleEmail(applicant.email, "Accepted", applicant.fullname)}
                                    >
                                        Accept
                                    </button>

                                    <button
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                        onClick={() => handleEmail(applicant.email, "Rejected", applicant.fullname)}
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-4">
                                No applicants available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

        </div>
    );
}

export default Applicants;