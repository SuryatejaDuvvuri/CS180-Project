import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
    const [projects, setProjects] = useState([]); // ✅ Renamed from currentCard to projects (since it holds project data)
    const [selectedMajor, setSelectedMajor] = useState("All"); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0); // ✅ Fixed feature index logic
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

    const fetchProjects = async () => {
        setLoading(true);
        try {
            let url = "http://localhost:8000/api/projects/";
            if (selectedMajor !== "All") {
                url += `?category=${encodeURIComponent(selectedMajor)}`;
            }

            const response = await fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                const data = await response.json();
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

    // ✅ Auto-cycle through features every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full flex flex-col items-center bg-gray-100">
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
                        <div className="flex justify-center mt-4">
                            {features.map((_, index) => (
                                <span 
                                    key={index}
                                    className={`w-3 h-3 rounded-full mx-1 cursor-pointer ${
                                        index === currentFeatureIndex ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                    onClick={() => setCurrentFeatureIndex(index)}
                                />
                            ))}
                        </div>
                    </section>

                    {/* 🔥 Filter & Project Display Section */}
                    <section className="text-center">
                        <h2 className="text-3xl font-bold mb-4">Explore Projects by Major</h2>
                        
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
                        </div>

                        {loading ? (
                            <p>Loading projects...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projects.map((project, index) => (
                                    <div key={project.id || index} className="bg-white shadow-md p-5 rounded-lg">
                                        <h3 className="text-xl font-semibold">{project.name}</h3>
                                        <p className="text-gray-700">{project.description}</p>
                                        <p className="text-sm text-gray-500">{project.start_date} - {project.end_date}</p>
                                        <p>{project.no_of_people} members</p>
                                        <p className="text-blue-600 font-semibold">{project.category}</p>
                                        <button 
                                            className="bg-blue-500 text-white px-4 py-2 rounded mt-3"
                                            onClick={() => navigate(`/project/${project.id}`)}
                                        >
                                            View Project
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
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