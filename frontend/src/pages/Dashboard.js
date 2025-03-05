import React, {useEffect,useState} from "react";
import Header from "../Header";
import NoteCards from "../NoteCards";
import { useNavigate } from "react-router-dom";
import {auth} from "../firebase";
export default function Dashboard({ selectedMajor }) {
    const [projects, setProjects] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [recommendedProjects, setRecommendedProjects] = useState([]); 

    const cs_projects = [
      { id: 1, title: 'Project A', Name: 'John', description: 'Working on 2D platformer game', looking_for: "college students", skills_required: ["C++", "Unity", "Game Design"], progress: "In Progress" },
      { id: 2, title: 'Project B', Name: 'Alice', description: 'Developing AI-based chatbots for customer service', looking_for: "software engineers", skills_required: ["Python", "Machine Learning", "Natural Language Processing"], progress: "Completed" },
      { id: 3, title: 'Project C', Name: 'Bob', description: 'Building a mobile app for task management', looking_for: "app developers", skills_required: ["React Native", "Firebase", "UI/UX Design"], progress: "In Progress" },
      { id: 4, title: 'Project D', Name: 'Eve', description: 'Creating a web app for time tracking and productivity', looking_for: "frontend developers", skills_required: ["JavaScript", "CSS", "React"], progress: "Not Started" },
      { id: 5, title: 'Project E', Name: 'Sarah', description: 'Developing a machine learning algorithm for image recognition', looking_for: "data scientists", skills_required: ["Python", "TensorFlow", "Computer Vision"], progress: "In Progress" },
      { id: 6, title: 'Project F', Name: 'Mike', description: 'Working on a cloud-based storage solution', looking_for: "cloud engineers", skills_required: ["AWS", "Node.js", "Security"], progress: "Completed" },
      { id: 7, title: 'Project G', Name: 'Tom', description: 'Building a social media platform for gamers', looking_for: "backend developers", skills_required: ["Node.js", "MongoDB", "WebSockets"], progress: "In Progress" },
      { id: 8, title: 'Project H', Name: 'Rachel', description: 'Creating a data visualization dashboard for business analytics', looking_for: "data analysts", skills_required: ["Python", "Tableau", "SQL"], progress: "Not Started" },
      { id: 9, title: 'Project I', Name: 'Chris', description: 'Developing a personal finance app', looking_for: "mobile developers", skills_required: ["Swift", "Xcode", "Financial APIs"], progress: "Completed" },
      { id: 10, title: 'Project J', Name: 'Diana', description: 'Building an e-commerce platform with advanced search features', looking_for: "full-stack developers", skills_required: ["React", "Node.js", "GraphQL"], progress: "In Progress" }
    ];
    
    const film_projects = [
      { id: 1, title: 'Short Film A', Name: 'Liam', description: 'Creating a sci-fi short film with practical effects', looking_for: "cinematographers", skills_required: ["Camera Operation", "Lighting", "Editing"], progress: "In Progress" },
      { id: 2, title: 'Documentary B', Name: 'Sophia', description: 'Producing a documentary about climate change', looking_for: "researchers", skills_required: ["Interviewing", "Research", "Video Editing"], progress: "Completed" },
      { id: 3, title: 'Animation C', Name: 'Noah', description: 'Developing a 2D animated short film', looking_for: "animators", skills_required: ["Adobe Animate", "Storyboarding", "Character Design"], progress: "In Progress" },
      { id: 4, title: 'Feature Film D', Name: 'Olivia', description: 'Directing an indie drama film', looking_for: "actors", skills_required: ["Acting", "Screenwriting", "Directing"], progress: "Not Started" },
      { id: 5, title: 'Experimental Film E', Name: 'James', description: 'Exploring avant-garde storytelling techniques', looking_for: "visual artists", skills_required: ["Abstract Filmmaking", "Color Grading", "Sound Design"], progress: "In Progress" },
      { id: 6, title: 'Horror Film F', Name: 'Emma', description: 'Shooting a psychological horror short', looking_for: "makeup artists", skills_required: ["SFX Makeup", "Set Design", "Cinematography"], progress: "Completed" },
      { id: 7, title: 'Music Video G', Name: 'Benjamin', description: 'Directing a music video for an indie band', looking_for: "editors", skills_required: ["Adobe Premiere", "After Effects", "Choreography"], progress: "In Progress" },
      { id: 8, title: 'Comedy Sketch H', Name: 'Ava', description: 'Filming a series of short comedy sketches', looking_for: "writers", skills_required: ["Comedy Writing", "Improv", "Editing"], progress: "Not Started" },
      { id: 9, title: 'Fantasy Film I', Name: 'Ethan', description: 'Creating a fantasy adventure short with CGI', looking_for: "VFX artists", skills_required: ["Blender", "Maya", "Compositing"], progress: "Completed" },
      { id: 10, title: 'Thriller Film J', Name: 'Mia', description: 'Producing a suspenseful thriller with a twist ending', looking_for: "producers", skills_required: ["Budgeting", "Casting", "Production Management"], progress: "In Progress" }
    ];

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

            const response = await fetch(`http://localhost:8000/api/recommend-projects/`, {
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
            setRecommendedProjects(data);
        }
        catch(err)
        {
            console.error("Error fetching recommended projects:", err);
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
                             <NoteCards items={recommendedProjects} category="Recommended" />
                         </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Computer Science Projects</h2>
                            <NoteCards 
                                items={projects.length > 0 ? projects.filter(proj => proj.category === "computer science".toLowerCase()) : cs_projects}
                                category="Computer Science" 
                            />
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Film Projects</h2>
                            <NoteCards 
                                items={projects.length > 0 ? projects.filter(proj => proj.category === "Film".toLowerCase()) : film_projects}
                                category="Film" 
                            />
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Engineering Projects</h2>
                            <NoteCards 
                               items={projects.filter(proj => proj.category === "Engineering")}
                                category="Engineering" 
                            />
                        </section>
                    </div>
                )}
         
         </main>
      </div>
    );
  }
  