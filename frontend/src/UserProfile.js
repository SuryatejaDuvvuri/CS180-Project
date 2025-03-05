import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import React, { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useParams, useNavigate} from 'react-router-dom';

export default function UserProfile()
{
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [projectsCreated, setProjectsCreated] = useState([]);
    const [projectsJoined, setProjectsJoined] = useState([]);
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
            getProjects(data.id, token);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching user profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const getProjects = async (userId, token) => {
        setLoading(true);
        try
        {
            const response = await fetch(`http://localhost:8000/api/users/${userId}/projects/`, {

                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                },
            });
            console.log(response);
            if(response.ok)
            {
                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error("Invalid response format: projects is not an array.");
                }
                console.log("Fetched Projects:", data);
                setProjectsCreated(data);
                
            }
            else
            {
                throw new Error("Failed to fetch projects");
            }

            const joinedResponse = await fetch(`http://localhost:8000/api/users/${userId}/projects_joined/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (joinedResponse.ok) {
                const joinedProjects = await joinedResponse.json();
                setProjectsJoined(joinedProjects);
            } else {
                throw new Error("Failed to fetch joined projects.");
            }

        }
        catch(err)
        {
            setError(err.message);
            console.error("Error fetching projects:", err);
        } 
        finally
        {
            setLoading(false);
        }
        
    }


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
                        <h3 className="text-xl font-bold mt-4">Skills & Interests</h3>
                        {/* <p className="text-gray-600">Skills: {user.skills.join(', ')}</p>
                        <p className="text-gray-600">Interests: {user.interests.join(', ')}</p> */}
                        <h3 className="text-xl font-bold mt-4">Resume</h3>
                        {user.resume ? (
                            <iframe src={user.resume} className="w-full h-64 border rounded-lg"></iframe>
                        ) : (
                            <p>No resume uploaded.</p>
                        )}
                        
                        <h3 className="text-xl font-bold mt-4">GitHub & LinkedIn</h3>
                        <p className="text-blue-500 hover:underline">
                            <a href={user.github} target="_blank" rel="noopener noreferrer"><FaGithub /> GitHub</a>
                        </p>
                        <p className="text-blue-500 hover:underline">
                            <a href={user.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin />LinkedIn</a>
                        </p>

                        <h3 className="text-xl font-bold mt-4">Projects Created</h3>
                        <ul className="list-disc ml-5">
                            {projectsCreated.length > 0 ? (
                                projectsCreated.map((project) => (
                                    <li key={project.id} className="text-blue-500 hover:underline">
                                        <a href={`/projects/${project.id}`}>{project.name}</a>
                                    </li>
                                ))
                            ) : (
                                <li>No projects created.</li>
                            )}
                        </ul>

                        <h3 className="text-xl font-bold mt-4">Projects Joined</h3>
                        <ul className="list-disc ml-5">
                            {projectsJoined.length > 0 ? (
                                projectsJoined.map((project) => (
                                    <li key={project.id} className="text-blue-500 hover:underline">
                                        <a href={`/projects/${project.id}`}>{project.name}</a>
                                    </li>
                                ))
                            ) : (
                                <li>No projects joined.</li>
                            )}
                        </ul>
                    </div>
                )
            )}
        </div>
    );
}

// export default UserProfile;