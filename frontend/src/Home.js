import React, { useState, useEffect } from "react";
import NoteCards from "./NoteCards";
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
                console.log(data);
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
                <NoteCards items = {projects} category ="Recommended" isProfilePage = {false}  />
            )}
        </div>
    );
}

export default Home;
