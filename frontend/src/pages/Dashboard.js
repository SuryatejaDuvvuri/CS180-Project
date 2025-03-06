import React, {useEffect,useState} from "react";
import Header from "../Header";
import NoteCards from "../NoteCards";
import { useMajors } from "../GetMajors"; 
import { useNavigate } from "react-router-dom";
import {auth} from "../firebase";
export default function Dashboard({ selectedMajor }) {
    const [projects, setProjects] = React.useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [recommendedProjects, setRecommendedProjects] = useState([]); 
    const majors = useMajors();

    
    const categorizedProjects = majors.reduce((acc, major) => {
        const filteredProjects = projects.filter(proj => (proj.category?.toLowerCase() || "") === major.toLowerCase());
        if (filteredProjects.length > 0) {
            acc.push({ category: major, projects: filteredProjects });
        }
        return acc;
    }, []);

    const getProjects = async () => {
        setLoading(true);
        try {
            let url = "http://localhost:8000/api/projects/";
            if (selectedMajor !== "All") {
                url += `?category=${encodeURIComponent(selectedMajor)}`;
            }
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
                setProjects(data);
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
      <div className="w-screen flex flex-col items-center justify-center">
        <main className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome to CollabHub🎉</h1>
        {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-xl text-gray-600">Loading projects...</p>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center">
                        Error: {error}
                    </div>
                ) : (
                    <div className="space-y-10">
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
                         {categorizedProjects.map(({ category, projects }) => (
                            <section key={category}>
                                <h2 className="text-2xl font-semibold mb-4">{category} Projects</h2>
                                <NoteCards 
                                    items={projects} 
                                    category={category} 
                                    setSelectedProject={setSelectedProject}
                                />
                            </section>
                        ))}
                    </div>
                )}
         
         </main>
      </div>
    );
  }
  