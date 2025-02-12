import React, { useState } from 'react';

import profileImage from './assets/profile.png';

//css 
import './css/NoteCards.css';
//jsx
import Note from "./Note.jsx"

function NoteCards({items = [], category}){

    
    const projects = items.slice();

    const [selectedProject, setSelectedProject] = useState(null);
    
    // Handle clicking on a preview box
    const handleClick = (project) => {
    setSelectedProject(project);
    };

    
    const [scrollIndex, setScrollIndex] = useState(0);
    const maxVisible = 5; // Number of visible notes

return(
    <>
        <div className="category-row">
            {/* Row of clickable boxes */}
            <h1 className='category'>{category}</h1>
            <div className="project-row">
                <button className = "arrowButton" onClick={() => setScrollIndex((prev) => Math.max(prev - 1, 0))}>←</button>

                {projects.slice(scrollIndex, scrollIndex + maxVisible).map((project) => (
                    <div key={project.id} className="project-box" onClick={() => handleClick(project)}>
                        <h3 className='project-title'>{project.title}</h3>
                        <img className="prev_image" src={profileImage} alt="Profile" />
                        <p>{project.description}</p>
                    </div>
                ))}

                <button className = "arrowButton" onClick={() => setScrollIndex((prev) => 
                Math.min(prev + 1, Math.max(0, projects.length - maxVisible)))}>→</button>

            </div>
        </div>
        
        <Note selectedProject ={selectedProject} setSelectedProject = {setSelectedProject}/>
    </>
);


}

export default NoteCards