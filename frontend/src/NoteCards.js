import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/NoteCards.css';

function NoteCards({ items = [], category }) {
    const navigate = useNavigate();
    const [projects, setProjects] = useState(items);
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

    return (
        <>
            <div className="category-row">
                <h1 className="category">{category}</h1>
                <div className="project-row">
                    <button className="arrowButton" onClick={handleLeftScroll}>
                        ←
                    </button>
                    <div className="projects flex overflow-hidden">
                        {projects.slice(scrollIndex, scrollIndex + maxVisible).map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                            >
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {item.skills_required?.map((skill, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Team Size: {item.team_size}</span>
                                        <button
                                            onClick={() => navigate(`/apply/${item.id}`)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors duration-300"
                                        >
                                            Apply Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="arrowButton" onClick={handleRightScroll}>
                        →
                    </button>
                </div>
            </div>
        </>
    );
}

export default NoteCards;
