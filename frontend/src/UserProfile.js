import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import React, { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useParams, useNavigate} from 'react-router-dom';

export default function UserProfile({darkMode, toggleDarkMode})
{
    const navigate = useNavigate();
    const { email } = useParams();
    const [user, setUser] = useState(null);
    const [projectsCreated, setProjectsCreated] = useState([]);
    const [projectsJoined, setProjectsJoined] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const auth = getAuth();
    const [isOwner, setIsOwner] = useState(true);
    const [isMember, setIsMember] = useState(false);
 
    useEffect(() => {
        

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
    }, [email]);

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
            const token = await user.getIdToken();
            const userEmail = email && email.includes("@") ? email :  user.email;

            if (!user) {
                setError("You need to be logged in to view this profile.");
                setLoading(false);
                return;
            }
       
            const response = await fetch(`http://localhost:8000/api/users/${userEmail}/`, {
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
            const responseTwo = await fetch(`http://localhost:8000/api/users/${user.email}/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json',
                     Authorization: `Bearer ${token}`,
                 }
            });

            if (!responseTwo.ok) {
                throw new Error("User not found");
            }

            const dataTwo = await responseTwo.json();
            const createdProjs = Array.isArray(dataTwo.projects_created) ? dataTwo.projects_created : [];
            const joinedProjs = Array.isArray(dataTwo.projects_joined) ? dataTwo.projects_joined : [];
            if (user.email === userEmail) {
                setIsOwner(true);
                setIsMember(true);
                return;
            }
            const isUserOwner = projectsCreated.some(proj => 
                createdProjs.some(proj2 => proj.id === proj2.id)
            );

            const isUserMember = projectsJoined.some(proj => 
                joinedProjs.some(proj2 => proj.id === proj2.id)
            );
            setIsOwner(isUserOwner);
            console.log(isOwner);
            setIsMember(isUserMember);
    
           
        } catch (err) {
            setError(err.message);
            console.error("Error fetching user profile:", err);
        } finally {
            setLoading(false);
        }
    };


    const leaveProject = async (projectId) => 
    {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                alert("You must be logged in to leave a project.");
                return;
            }
    
            const idToken = await user.getIdToken();
    
            const response = await fetch(`http://localhost:8000/api/projects/delete/${projectId}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
            });
    
            if (!response.ok) {
                throw new Error("Failed to leave the project.");
            }
    
            alert("Successfully left the project.");
            setProjectsJoined((prev) => prev.filter((project) => project.id !== projectId));
        } catch (err) {
            console.error("Error leaving project:", err);
            alert("Error leaving project. Please try again.");
        }
    };

    const getProjects = async (userId, token) => {
        setLoading(true);
        try
        {
            const response = await fetch(`http://localhost:8000/api/users/${userId}/projects`, {

                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                },
            });
            if(response.ok)
            {
                const data = await response.json();

                if (!Array.isArray(data.projects_created)) {
                    throw new Error("Invalid response format: projects is not an array.");
                }
                setProjectsCreated(data.projects_created);
                setProjectsJoined(data.projects_joined);
                
            }
            else
            {
                throw new Error("Failed to fetch projects");
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
        <div className={`${darkMode === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen py-8`}>
            <h1 className="text-3xl font-bold text-center mb-6">User Profile</h1>
            {loading ? (
                <p className="text-center text-lg font-semibold">Loading user profile...</p>
            ) : user ? ( 
                <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">{user.fullname}</h2>
                            <p><strong>NetID:</strong> {user.net_id}</p>
                            <p><strong>Pronouns:</strong> {user.pronouns || "Not specified"}</p>
                            <p><strong>Location:</strong> {user.location || "Not specified"}</p>
                            <p><strong>Experience:</strong> {user.experience || "No experience listed"}</p>
                            <p><strong>Weekly Hours:</strong> {user.weekly_hours || "Not specified"} hrs</p>
                        </div>


                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Skills & Interests</h3>
                            <p><strong>Skills:</strong> {user.skills?.length ? user.skills.join(', ') : "No skills listed"}</p>
                            <p><strong>Interests:</strong> {user.interests?.length ? user.interests.join(', ') : "No interests listed"}</p>
                            <div className="flex justify-center items-center space-x-6 mt-4">
                                {user.github && (
                                    <a href={user.github} target="_blank" rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-600 transition transform hover:scale-110">
                                        <FaGithub className="text-5xl" /> 
                                    </a>
                                )}
                                {user.linkedin && (
                                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-600 transition transform hover:scale-110">
                                        <FaLinkedin className="text-5xl" /> 
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>


                    <div>
                        <h3 className="text-xl font-bold">Resume</h3>
                        <div className="w-full h-[500px] border rounded-lg overflow-hidden">
                            {user.resume ? (
                                <iframe src={user.resume} className="w-full h-full"></iframe>
                            ) : (
                                <p className="text-gray-500 text-center">No resume uploaded.</p>
                            )}
                        </div>
                    </div>


                    <div>
                        <h3 className="text-xl font-bold">Projects Created</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projectsCreated.length >= 1 ? (
                                projectsCreated.filter((project) => project.id !== "init").map((project) => (
                                    <div key={project.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition">
                                        {project.image && (
                                            <img src={project.image} alt={project.name} className="w-full h-48 object-cover rounded-t-lg" />
                                        )}
                                        <div className="p-4">
                                            <h2 className="text-xl font-semibold">{project.name}</h2>
                                            <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
                                            <p className="text-sm text-gray-500"><strong>Deadline:</strong> {project.end_date ? new Date(project.end_date).toDateString() : "N/A"}</p>
                                            <p className="text-sm text-gray-500"><strong>Looking for:</strong> {project.looking_for || "Not specified"}</p>

                                            {isOwner && (
                                                <div className="mt-2 space-y-2">
                                                    <a href={`/${user.email}/${project.id}/applicants/`} className="text-blue-500 hover:underline block">
                                                        View Applicants
                                                    </a>
                                                    <a href={`/${project.id}/feedback/`} className="text-blue-500 hover:underline block">
                                                        View Feedbacks
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center col-span-3">No projects created yet.</p>
                            )}
                        </div>
                    </div>


                    <div>
                        <h3 className="text-xl font-bold">Projects Joined</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projectsJoined.length >= 1 ? (
                                projectsJoined.filter((project) => project.id !== "init").map((project) => (
                                    <div key={project.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition">
                                        {project.image && (
                                            <img src={project.image} alt={project.name} className="w-full h-48 object-cover rounded-t-lg" />
                                        )}
                                        <div className="p-4">
                                            <h2 className="text-xl font-semibold">{project.name}</h2>
                                            <p className="text-gray-600 dark:text-gray-300">{project.description || "No description provided"}</p>
                                            <p className="text-sm text-gray-500"><strong>Deadline:</strong> {project.end_date ? new Date(project.end_date).toDateString() : "N/A"}</p>
                                            <p className="text-sm text-gray-500"><strong>Looking for:</strong> {project.looking_for || "Not specified"}</p>
                                            <p className="text-sm text-blue-600 font-semibold"><strong>Role:</strong> {project.role || "N/A"}</p>


                                            <div className="flex justify-between mt-3">
                                                {isMember && (
                                                    <button
                                                        onClick={() => leaveProject(project.id)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                                    >
                                                        Leave
                                                    </button>
                                                )}
                                                {isMember && (
                                                    <button
                                                        onClick={() => navigate(`/${project.id}/feedback/`)}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                                                    >
                                                        Give Feedback
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <p className="text-gray-500 text-center col-span-3">No projects joined yet.</p>
                        )}
                        </div>
                    </div>

                </div>
            ) : (
                
                <p className="text-center text-gray-500 text-lg">User data not found.</p>
            )}
        </div>
    );
}

// export default UserProfile;