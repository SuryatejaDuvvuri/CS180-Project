import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/NoteCards.css';
import Note from './Note';

function NoteCards({ items = [], category }) {
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
            <div className="category-row">
                {/* <h1 className="category">{category}</h1> */}
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
                                {item.image_url && (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-40 object-cover"
                                    />
                                    // <img src={project.image_base64} alt="Project" className="w-full h-48 object-cover rounded-lg" />
                                )}
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="text-sm text-gray-500">
                                            Summary: {item.summary}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Category: {item.category}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Looking For: {item.looking_for}
                                        </span>
                                        <span className="text-sm text-gray-500">Team Size: {item.number_of_people}</span>
                                    </div>

                                    <button
                                        onClick={() => openModal(item)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors duration-300"
                                    >
                                        View Details
                                    </button>
                                    {/* <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Team Size: {item.team_size}</span>
                                        <button
                                            onClick={() => navigate(`/apply/${item.id}`)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors duration-300"
                                        >
                                            Apply Now
                                        </button>
                                    </div> */}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="arrowButton" onClick={handleRightScroll}>
                        →
                    </button>
                </div>
            </div>

            {selectedProject && (
                <Note selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
            )}
        </>
    );
}

export default NoteCards;
