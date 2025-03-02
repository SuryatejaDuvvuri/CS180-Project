import React, { useState, useEffect } from "react";

function Home() {
    const [projects, setProjects] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState("All"); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
        <div className="bg-gray-100 min-h-screen p-5">
            <h1 className="text-3xl font-bold text-center mb-5">Find Projects</h1>
            <div className="flex justify-center mb-5">
                <select
                    className="border p-2 rounded-lg"
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

            {error && <p className="text-red-500">{error}</p>}
            {loading ? (
                <p className="text-center">Loading projects...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.length > 0 ? (
                        projects.map((project) => (
                            <div key={project.id} className="bg-white shadow-md p-5 rounded-lg">
                                <h3 className="text-xl font-semibold">{project.name}</h3>
                                <p className="text-gray-700">{project.description}</p>
                                <p className="text-sm text-gray-500">{project.start_date} - {project.end_date}</p>
                                <p>Category: {project.category}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center">No projects available for this major.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Home;
