import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import React, { useState, useEffect } from 'react';

import { useParams, Navigate} from 'react-router-dom';

export default function UserProfile()
{
    // const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                await fetchUserProfile(user);
            } else {
                setError("You need to be logged in to view this profile.");
                setLoading(false);
            }
        });

        return () => unsubscribe(); 
    }, []);

    // useEffect(() => {
    //     fetchUserProfile();
    // }, []);

    const fetchUserProfile = async (user) => {
        setLoading(true);
        setError(null);
        try {
            if (!user) 
            {
                setError("User is not authenticated.");
                setLoading(false);
                return;
            }
            const token = await user.getIdToken(user);
            const email = user.email;
            console.log(user);

            if (!user) {
                setError("You need to be logged in to view this profile.");
                setLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:8000/api/users/${email}/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json',
                     Authorization: `Bearer ${token}`,
                 }
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
        <div className="bg-gray-100 min-h-screen p-5 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-center mb-5">User Profile</h1>

            {error && <p className="text-red-500">{error}</p>}
            {loading ? (
                <p className="text-center">Loading user profile...</p>
            ) : (
                user && (
                    <div className="max-w-2xl w-full bg-white p-6 shadow-lg rounded-lg">
                        <h2 className="text-2xl font-bold">Name: {user.fullname}</h2>
                        <p className="text-gray-600">NetID: {user.net_id}</p>
                        <p className="text-gray-600">Pronouns: {user.pronouns || "Not specified"}</p>
                        <p className="text-gray-600">Location: {user.location || "Not specified"}</p>
                        <p className="text-gray-600">Experience: {user.experience || "No experience listed"}</p>
                        <p className="text-gray-600">Weekly Hours: {user.weekly_hours || "Not specified"} hrs</p>

                        <button 
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => Navigate("/home")}
                        >
                            Back to Home
                        </button>


                        <button 
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => {
                                signOut(getAuth());
                                Navigate("/login");
                            }}
                        >
                            Logout
                        </button>
                    </div>
                )
            )}
        </div>
    );
}

// export default UserProfile;