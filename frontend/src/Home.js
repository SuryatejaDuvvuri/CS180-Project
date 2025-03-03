import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import "./Home.css";
function Home() {
    const [currentCard, setCurrentCard] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState("All"); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const features = [
        {
            title: "Find Your Dream Project",
            description: "Browse through hundreds of projects across different disciplines",
        },
        {
            title: "Connect with Teams",
            description: "Join teams that match your skills and interests",
        },
        {
            title: "Build Your Portfolio",
            description: "Gain real-world experience through collaborative projects",
        },
        {
            title: "Flexible Commitment",
            description: "Choose projects that fit your schedule",
        }
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
    };

    return (
        <div className = "w-full min-h-screen flex flex-col items-center bg-gray-100">
            <div className="bg-gray-100 min-h-screen p-5">
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
                        <div className="flex justify-center items-center">
                            {features.map((feature, index) => (
                                <div 
                                    key={index}
                                    className={`absolute transition-opacity duration-500 ${index === currentCard ? 'opacity-100' : 'opacity-0'}`}
                                >
                                    <div className="bg-white p-10 rounded-lg shadow-lg text-center">
                                        <div className="text-6xl mb-4">{feature.icon}</div>
                                        <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
                                        <p className="text-gray-700">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center mt-4">
                            {features.map((_, index) => (
                                <span 
                                    key={index}
                                    className={`w-3 h-3 rounded-full mx-1 cursor-pointer ${index === currentCard ? 'bg-blue-500' : 'bg-gray-300'}`}
                                    onClick={() => setCurrentCard(index)}
                                />
                            ))}
                        </div>
                    </section>

                    <section className="text-center">
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
