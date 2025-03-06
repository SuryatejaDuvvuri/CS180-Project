import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {auth} from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
function Home() {
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

    const majors = [
        "All",
        "Computer Science",
        "Film",
        "Business",
        "Engineering",
        "Biology",
        "Psychology",
        "Mathematics",
        "Physics",
        "Art",
        "Law",
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
        }, 3000);
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
        <div className="w-screen h-screen flex flex-col items-center bg-gray-100">
            <div className="bg-gray-100 p-5">
                
                <header className="flex justify-between items-center p-5 bg-white shadow-md">
                    <div className="text-3xl font-bold text-center">ProjectHub</div>
                    <div>
                        <button 
                            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                            onClick={() => navigate('/signup')}
                        >
                            Sign Up
                        </button>
                        <button 
                            className="bg-transparent border-2 border-blue-500 text-blue-500 px-4 py-2 rounded"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </button>
                    </div>
                </header>

                <main className="mt-10">
                    <section className="text-center mb-10">
                        <h1 className="text-4xl font-bold mb-4">Discover & Join Amazing Projects</h1>
                        <p className="text-lg text-gray-700">Connect with other students and work on exciting projects together</p>
                    </section>

                    <section className="w-full flex justify-center mb-10">
                        {/* <div className="flex justify-center mt-4">
                            {features.map((_, index) => (
                                <span 
                                    key={index}
                                    className={`w-3 h-3 rounded-full mx-1 cursor-pointer ${
                                        index === currentFeatureIndex ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                    onClick={() => setCurrentFeatureIndex(index)}
                                />
                            ))}
                        </div> */}
                        <div className="relative w-full max-w-3xl h-32 flex justify-center items-center overflow-hidden">
                            {features.map((feature, index) => (
                                <div 
                                    key={index}
                                    className={`absolute w-full transition-opacity duration-500 flex flex-col items-center text-center ${
                                        index === currentFeatureIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                                    }`}
                                >
                                    <div className="bg-white p-6 rounded-lg shadow-lg">
                                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                        <p className="text-gray-700">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                    </section>

                    <section className="text-center">
                        {/* <h2 className="text-3xl font-bold mb-4">Explore Projects by Major</h2>
                        
                        <div className="flex justify-center mb-6">
                            <select 
                                className="p-2 border rounded"
                                value={selectedMajor}
                                onChange={(e) => setSelectedMajor(e.target.value)}
                            >
                                {majors.map((major, index) => (
                                    <option key={index} value={major}>
                                        {major}
                                    </option>
                                ))}
                            </select>
                        </div> */}

                        {loading ? (
                            <p>Loading projects...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : 
                        projects.length > 0 ? (
                           <>
                            <h2 className="text-2xl font-semibold mb-4">
                                    {isAuthenticated ? "Your Recommended Projects" : "Explore Some Projects"}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projects
                                    .filter((project) => new Date(project.end_date) >= new Date()) 
                                    .map((project) => (
                                        <div key={project.id} className="bg-white p-4 rounded shadow-md">
                                            <h2 className="text-xl font-semibold">{project.name}</h2>
                                            <p className="text-gray-600">{project.description}</p>
                                            <p className="text-gray-600">
                                                <strong>Deadline:</strong> {new Date(project.end_date).toDateString()}
                                            </p>
                                            <p className="text-sm text-gray-500">Looking for: {project.looking_for}</p>
                                        </div>
                                    ))}
                            </div>
                            </>
                        ) : filteredProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <h2 className="text-2xl font-semibold mb-4">
                                    {isAuthenticated ? "Your Recommended Projects" : "Explore Some Projects"}
                                </h2>
                                {filteredProjects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredProjects.map((project) => (
                                        <div key={project.id} className="bg-white p-4 rounded shadow-md">
                                            <h2 className="text-xl font-semibold">{project.name}</h2>
                                            <p className="text-gray-600">{project.description}</p>
                                            <p className="text-sm text-gray-500">Category: {project.category}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">No projects available in this category.</p>
                            )}
                            
                            </div>
                        ) 
                        : (
                            <p>No projects found for {selectedMajor}.</p>
                        )}
                    </section>

                    <section className="text-center mt-10">
                        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
                        <button 
                            className="bg-blue-500 text-white px-6 py-3 rounded text-lg"
                            onClick={() => navigate('/signup')}
                        >
                            Get Started Now
                        </button>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Home;