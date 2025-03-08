import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/NoteCards.css';
import Note from './Note';

function NoteCards({darkMode, toggleDarkMode, items = [], category }) {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [projects, setProjects] = useState(Array.isArray(items) ? items : []);
    const [selectedProject, setSelectedProject] = useState(null);
    const [scrollIndex, setScrollIndex] = useState(0);
    const maxVisible = 3; 


    const handleLeftScroll = () => {
        setScrollIndex((prev) => Math.max(prev - 1, 0));
    };


    const handleRightScroll = () => {
        setScrollIndex((prev) =>
            Math.min(prev + 1, Math.max(0, projects.length - maxVisible))
        );
    };

    const openModal = (project) => setSelectedProject(project);
    const closeModal = () => setSelectedProject(null);

    return (
        <>
            <div className={`category-row ${darkMode === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
                <div className="flex items-center space-x-4">
                    

                    <button 
                        className={`arrowButton px-3 py-2 rounded-full transition ${
                            darkMode === "dark" ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-300 hover:bg-gray-400"
                        }`}
                        onClick={handleLeftScroll}
                    >
                        ←
                    </button>


                    <div className="flex overflow-x-auto space-x-8 p-4 snap-x scroll-smooth">
                        {projects.slice(scrollIndex, scrollIndex + maxVisible).map((item) => (
                            <div
                                key={item.id}
                                className={`rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${
                                    darkMode === "dark" ? "bg-gray-800 text-gray-200" : "bg-white"
                                }`}
                                style={{
                                    backgroundColor: item.color,
                                }}
                            >

                                {item.image_url || item.image ? (
                                    <img
                                        src={item.image_url || item.image}
                                        alt={item.name || "Project Image"}
                                        className="w-full h-48 object-cover rounded-t-lg"
                                    />
                                ) : (
                                    <div className={`w-full h-48 flex items-center justify-center rounded-t-lg ${
                                        darkMode === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-500"
                                    }`}>
                                        <span>No Image</span>
                                    </div>
                                )}


                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                                    <p className={`text-sm mb-3 line-clamp-2 ${
                                        darkMode === "dark" ? "text-gray-200" : "text-gray-600"
                                    }`}>
                                        {item.summary}
                                    </p>


                                    <div className={`flex flex-col gap-2 text-sm ${
                                        darkMode === "dark" ? "text-gray-200" : "text-gray-500"
                                    }`}>
                                        <span>Category: {item.category}</span>
                                        <span>Looking for: {item.looking_for}</span>
                                        <span>Team size: {item.number_of_people}</span>
                                    </div>


                                    <button
                                        onClick={() => openModal(item)}
                                        className={`mt-4 px-4 py-2 rounded-md text-sm transition ${
                                            darkMode === "dark" 
                                                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                                : "bg-blue-500 hover:bg-blue-600 text-white"
                                        }`}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>


                    <button 
                        className={`arrowButton px-3 py-2 rounded-full transition ${
                            darkMode === "dark" ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-300 hover:bg-gray-400"
                        }`}
                        onClick={handleRightScroll}
                    >
                        →
                    </button>
                </div>
            </div>

            {selectedProject && (
                <Note darkMode = {darkMode} toggleDarkMode = {toggleDarkMode} selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
            )}
        </>
    );
}

export default NoteCards;
