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
        <div className={`dark:bg-gray-900${darkMode === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
            <h1 className="text-3xl font-bold text-center mb-5">User Profile</h1>

            {error && <p className="text-red-500">{error}</p>}
            {loading ? (
                <p className="text-center">Loading user profile...</p>
            ) : (
                user && (
                    <div className="w-full bg-white shadow-lg rounded-lg">
                        <h2 className="text-2xl font-bold">Name: {user.fullname}</h2>
                        <p className="text-gray-600">NetID: {user.net_id}</p>
                        <p className="text-gray-600">Pronouns: {user.pronouns || "Not specified"}</p>
                        <p className="text-gray-600">Location: {user.location || "Not specified"}</p>
                        <p className="text-gray-600">Experience: {user.experience || "No experience listed"}</p>
                        <p className="text-gray-600">Weekly Hours: {user.weekly_hours || "Not specified"} hrs</p>
                        <h3 className="text-xl font-bold mt-4">Skills & Interests</h3>
                        <p className="text-gray-600">Skills: {Array.isArray(user.skills) && user.skills.length > 0 ? user.skills.join(', ') : "No skills listed"}</p>
                        <p className="text-gray-600">Interests: {Array.isArray(user.interests) && user.interests.length > 0 ? user.interests.join(', ') : "No interests listed"}</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projectsCreated.length > 0 ? (
                                            projectsCreated
                                            .filter((project) => 
                                                project.id !== "init" 
                                            ).map((project) => (
                                                    <div key={project.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                                        {project.image && (
                                                            <img src={project.image} alt={project.name} className="w-full h-48 object-cover rounded-t-lg" />
                                                        )}
                                                        <div className="p-4">
                                                            <h2 className="text-xl font-semibold">{project.name}</h2>
                                                            <p className="text-gray-600">{project.description}</p>
                                                            <p className="text-gray-600">
                                                                <strong>Deadline:</strong> {project.end_date ? new Date(project.end_date).toDateString() : "N/A"}
                                                            </p>
                                                            <p className="text-sm text-gray-500"><strong>Looking for:</strong> {project.looking_for || "Not specified"}</p>
                                                                
                                                            {isOwner && (
                                                                     <a 
                                                                     href={`/${user.email}/${project.id}/applicants/`} 
                                                                         className={`text-blue-500 hover:underline mt-2 inline-block `}
                                                                 >
                                                                 View Applicants
                                                                 </a>
                                                                 
                                                            )} 

                                                            {isOwner && (
                                                                  <a 
                                                                  href={`/${project.id}/feedback/`} 
                                                                  className={`text-blue-500 hover:underline mt-2 inline-block ${isMember ? '' : 'hidden'}`}
                                                                  >
                                                                  View Feedbacks
                                                                  </a>
                                                            )}
                                                               

                                                              
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <p className="text-gray-500 text-center col-span-3">No projects created yet.</p>
                                        )}
                                    </div>

                        <h3 className="text-xl font-bold mt-4">Projects Joined</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projectsJoined.length > 0 ? (
                                    projectsJoined
                                        .filter((project) => project.id !== "init")
                                        .map((project) => (
                                        <div key={project.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                            {project.image && (
                                                <img src={project.image} alt={project.name} className="w-full h-48 object-cover rounded-t-lg" />
                                            )}
                                            <div className="p-4">
                                                <h2 className="text-xl font-semibold">{project.name}</h2>
                                                <p className="text-gray-600">{project.description}</p>
                                                <p className="text-gray-600">
                                                    <strong>Deadline:</strong> {project.end_date ? new Date(project.end_date).toDateString() : "N/A"}
                                                </p>
                                                <p className="text-sm text-gray-500"><strong>Looking for:</strong> {project.looking_for || "Not specified"}</p>
                                                <p className="text-sm text-blue-600 font-semibold">
                                                    <strong>Role:</strong> {project.role || "N/A"}
                                                </p>
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

                            {auth.currentUser?.email === email && (
                                <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                                    Edit Profile
                                </button>
                            )}
                    </div>
                )
            )}
        </div>
    );
}

// export default UserProfile;