import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function UserProfile()
{
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error("User not found");
            }

            const data = await response.json();
            setUser(data);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching user profile:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-5">
            <h1 className="text-3xl font-bold text-center mb-5">User Profile</h1>

            {error && <p className="text-red-500">{error}</p>}
            {loading ? (
                <p className="text-center">Loading user profile...</p>
            ) : (
                user && (
                    <div className="max-w-2xl mx-auto bg-white p-6 shadow-lg rounded-lg">
                        <h2 className="text-2xl font-bold">Name: {user.fullname}</h2>
                        <p className="text-gray-600">NetID: {user.net_id}</p>
                        <p className="text-gray-600">Pronouns: {user.pronouns}</p>
                        <p className="text-gray-600">Location: {user.location}</p>
                        <p className="text-gray-600">Experience: {user.experience}</p>
                        <p className="text-gray-600">Weekly Hours: {user.weekly_hours} hrs</p>
                        
                        <h3 className="text-xl font-bold mt-4">Skills & Interests</h3>
                        <p className="text-gray-600">Skills: {user.skills.join(', ')}</p>
                        <p className="text-gray-600">Interests: {user.interests.join(', ')}</p>

                        <h3 className="text-xl font-bold mt-4">Projects</h3>
                        <ul className="list-disc ml-5">
                            {user.projects_created.length > 0 ? (
                                user.projects_created.map((projectId) => (
                                    <li key={projectId} className="text-blue-500 hover:underline">
                                        <a href={`/projects/${projectId}`}>Project {projectId}</a>
                                    </li>
                                ))
                            ) : (
                                <li>No projects created.</li>
                            )}
                        </ul>
                    </div>
                )
            )}
        </div>
    );
}

// export default UserProfile;