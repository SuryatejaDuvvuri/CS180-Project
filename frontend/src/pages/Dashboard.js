import React, {useEffect,useState, useMemo} from "react";
import Header from "../Header";
import NoteCards from "../NoteCards";
import { useMajors } from "../GetMajors"; 
import { useNavigate } from "react-router-dom";
import {auth} from "../firebase";
export default function Dashboard({ darkMode, toggleDarkMode, selectedMajor, setSelectedMajor }) {
    const [projects, setProjects] = React.useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [recommendedProjects, setRecommendedProjects] = useState([]); 
    const majors = useMajors();

    const categorizedProjects = majors.reduce((acc, major) => {
        const filteredProjects = projects.filter(proj => (proj.category?.toLowerCase() || "") === major.toLowerCase());
        if (filteredProjects.length > 0) {
            acc.push({ category: major, projects: filteredProjects });
        }
        return acc;
    }, []);

    const searchedProjects = useMemo(() => {
        if (!searchQuery) return [];
        return projects.filter(project =>{
            const projectName = project.name?.trim().toLowerCase() || "";
            const projectSummary = project.description?.trim().toLowerCase() || "";
            const projectDetails = project.looking_for?.trim().toLowerCase() || "";
            const query = searchQuery.trim().toLowerCase();

            return (
                projectName.includes(query) ||
                projectSummary.includes(query) ||
                projectDetails.includes(query)
            );
        });
    }, [searchQuery, projects]);



    const getProjects = async () => {
        setLoading(true);
        try {
            let url = "http://localhost:8000/api/projects/";
            // if (selectedMajor !== "All") {
            //     url += `?category=${encodeURIComponent(selectedMajor)}`;
            // }
            const user = auth.currentUser;
            const idToken = await user.getIdToken();
            const response = await fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}`, },
            });

            if (response.ok) {
                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error("Invalid response format: projects is not an array.");
                }
                console.log("Fetched Projects:", data);
                const userEmail = user.email;
                const filteredProjects = data.filter(project => project.owner !== userEmail);
                
                if (selectedMajor === "All") {
                    setProjects(data); 
                } else {
                    setProjects(data.filter(proj => proj.category === selectedMajor));
                }
            } else {
                throw new Error("Failed to fetch projects");
            }
        } catch (err) {
            setError(err.message);
            console.error("Error fetching projects:", err);
        } finally {
            setLoading(false);
        }
    }
    

    const fetchRecommendedProjects = async () => {
        setLoading(true);
        try
        {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) 
            {
                console.error("No authenticated user found.");
                return;
            }

            const idToken = await user.getIdToken();
            const email = user.email;

            const response = await fetch(`http://localhost:8000/api/recommend-projects/${email}/`, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
            });

            if (!response.ok) 
            {
                throw new Error("Failed to fetch recommended projects");
            }

            const data = await response.json();
            console.log("Recommended Projects Response:", data.recommended_projects);

            if (Array.isArray(data.recommended_projects)) {
                setRecommendedProjects(data.recommended_projects);
            } else {
                console.error("Invalid format for recommended projects:", data);
                setRecommendedProjects([]);
            }
        }
        catch(err)
        {
            console.error("Error fetching recommended projects:", err);
            setRecommendedProjects([]);
        }
        finally
        {
            setLoading(false);
        }
    }

    // const getProjectsByCategory = (category) => {
    //   return projects.filter(project => project.category === category);
    // };
    React.useEffect(() => {
        getProjects();
        
    }, [selectedMajor]);

    React.useEffect(() => {
        fetchRecommendedProjects();;
    }, []);


    return (
        <div className={`w-screen min-h-screen ${darkMode === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
        <main className={`w-full min-h-screen p-6 ${darkMode === "dark" ? "bg-gray-800 shadow-md" : "bg-white shadow-md"}`}>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search for a project..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-400 focus:outline-none ${darkMode === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}
                    />
                </div>
            <h1 className="text-3xl font-bold mb-8 text-center">Welcome to Tech Nexus🎉</h1>
    
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-xl text-gray-400">Loading projects...</p>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center font-semibold">
                    Error: {error}
                </div>
            ) : (
                <div className="space-y-10">

                {searchedProjects.length > 0 ? (
                    searchedProjects.map((project) => (
                        <div key={project.id} className={`p-4 rounded-lg shadow-md transition 
                            ${darkMode === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
                            <h2 className="text-xl font-semibold">{project.name}</h2>
                            <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
                            <p className="text-sm text-gray-500">
                                <strong>Looking for:</strong> {project.looking_for || "Not specified"}
                            </p>
                        </div>
                    ))
                ) : (
                    <></>
                )}

                    {recommendedProjects.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Recommended Projects</h2>
                            <NoteCards 
                                items={recommendedProjects.map(project => ({
                                    project_id: project.project_id || "N/A",
                                    image_url: project.image_url || "",  
                                    name: project.name || "Unnamed Project",
                                    description: project.description || "No description available.",
                                    owner: project.owner || "Unknown",
                                    category: project.category || "Uncategorized",
                                    looking_for: project.looking_for || "Not specified",
                                    weekly_hours: project.weekly_hours || 0,
                                    team_size: project.number_of_people || 1,
                                    start_date: project.start_date || "No start date",
                                    end_date: project.end_date || "No end date",
                                }))} 
                                category="Recommended" 
                            />
                        </section>
                    )}
    
                        {categorizedProjects.length > 0 ? (
                         categorizedProjects.map(({ category, projects }) => {
                            const filteredProjects = projects.filter(project => project.owner !== auth.currentUser?.email);

                            return filteredProjects.length > 0 ? (
                                <section key={category} className="mb-8">
                                    <h2 className="text-2xl font-semibold mb-4">{category} Projects</h2>
                                    <NoteCards 
                                        darkMode={darkMode} 
                                        toggleDarkMode={toggleDarkMode} 
                                        items={filteredProjects} 
                                        category={category} 
                                        setSelectedProject={setSelectedProject}
                                    />
                                </section>
                            ) : null;  
                        })
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-xl text-gray-400">No Projects Avaliable</p>
                        </div>
                    )}
                </div>
            )}
    
        </main>
    </div>
    );
  }
  