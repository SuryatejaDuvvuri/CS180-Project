import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {auth} from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
function Home({theme, toggleTheme}) {
    const [projects, setProjects] = useState([]); 
    const [selectedMajor, setSelectedMajor] = useState("All"); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0); 
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const features = [
        { title: "Find Your Dream Project", description: "Browse through hundreds of projects across different disciplines" },
        { title: "Connect with Teams", description: "Join teams that match your skills and interests" },
        { title: "Build Your Portfolio", description: "Gain real-world experience through collaborative projects" },
        { title: "Flexible Commitment", description: "Choose projects that fit your schedule" }
    ];

    useEffect(() => {
        fetchProjects();
    }, [selectedMajor]); 

    const fetchProjects = async (user) => {
        setLoading(true);
        try {
            let url = "http://localhost:8000/api/projects/";
            // if (selectedMajor !== "All") {
            //     url += `?category=${encodeURIComponent(selectedMajor)}`;
            // }

            const headers = { "Content-Type": "application/json" };
            if (user) {
                const token = await user.getIdToken();
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(url, { method: "GET", headers });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setProjects(Array.isArray(data) ? data : []);
            } else {
                throw new Error("Failed to fetch projects");
            }
        } catch (err) {
            setError(err.message);
            console.error("Error fetching projects:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
            fetchProjects(user);  
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleMajorSelect = (major) =>
    {
        setSelectedMajor(major);
        if (major === "All") {
            setFilteredProjects(projects);
        } else {
            const filtered = projects.filter(project => project.category === major);
            setFilteredProjects(filtered);
        }
    };

    return (
        <div className={`w-screen h-screen flex flex-col items-center ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
            {/* Header Section */}
            <header className={`w-full flex justify-between items-center px-6 py-4 ${theme === "dark" ? "bg-gray-800 shadow-md" : "bg-white shadow-md"}`}>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ProjectHub</h1>
                <div className="flex gap-4">
                    <button 
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        onClick={() => navigate('/signup')}
                    >
                        Sign Up
                    </button>
                    <button 
                        className="border-2 border-blue-500 text-white px-4 py-2 rounded hover:bg-blue-500 hover:text-white transition"
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </button>
                </div>
            </header>

            <main className="w-full max-w-6xl p-6">
                {/* Hero Section */}
                <section className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Discover & Join Amazing Projects</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Connect with other students and work on exciting projects together</p>
                </section>

                {/* Feature Highlight Section */}
                <section className="w-full flex justify-center mb-10">
                    <div className="relative w-full max-w-3xl h-32 flex justify-center items-center overflow-hidden">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className={`absolute w-full transition-opacity duration-700 transform ${
                                    index === currentFeatureIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                                }`}
                            >
                                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg text-center">
                                    <h3 className="text-xl font-semibold dark:text-white">{feature.title}</h3>
                                    <p className="text-gray-700 dark:text-gray-300">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Project Listing Section */}
                <section className="text-center">
                    {loading ? (
                        <p className="text-gray-600 dark:text-gray-300">Loading projects...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : projects.length > 0 ? (
                        <>
                            <h2 className="text-2xl font-semibold mb-4 dark:text-white">
                                {isAuthenticated ? "Your Recommended Projects" : "Explore Some Projects"}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects
                                    .filter((project) => new Date(project.end_date) >= new Date())
                                    .map((project) => (
                                        <div key={project.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-lg transition">
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{project.name}</h2>
                                            <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
                                            <p className="text-gray-500 dark:text-gray-400"><strong>Deadline:</strong> {new Date(project.end_date).toDateString()}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Looking for: {project.looking_for}</p>
                                        </div>
                                    ))}
                            </div>
                        </>
                    ) : filteredProjects.length > 0 ? (
                        <>
                            <h2 className="text-2xl font-semibold mb-4 dark:text-white">
                                {isAuthenticated ? "Your Recommended Projects" : "Explore Some Projects"}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.map((project) => (
                                    <div key={project.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-lg transition">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{project.name}</h2>
                                        <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Category: {project.category}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-300">No projects found for {selectedMajor}.</p>
                    )}
                </section>

                {/* Call to Action */}
                <section className="text-center mt-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to Start Your Journey?</h2>
                    <button 
                        className="bg-blue-500 text-white px-6 py-3 rounded text-lg hover:bg-blue-600 transition"
                        onClick={() => navigate('/signup')}
                    >
                        Get Started Now
                    </button>
                </section>
            </main>
        </div>
    );
}

export default Home;