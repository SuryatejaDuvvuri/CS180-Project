import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import profileImage from './assets/profile.png';

//css 
import './css/NoteCards.css';
//jsx
import Note from "./Note.jsx"

function NoteCards({items = [], category, isProfilePage}){
    //get project info from Home.js and display it
    //check if the 

    const [projects, setProjects] = useState( items || []);
    const [selectedProject, setSelectedProject] = useState(null);
    const [scrollIndex, setScrollIndex] = useState(0);
    const maxVisible = 5; // Number of visible notes


    // Handle clicking on a preview box
    const handleClick = (project) => {
    setSelectedProject(project);
    };


return(
    <>  
        <div className="category-row">
            {/* Row of clickable boxes */}
            <h2 className='category'>{category}</h2>
            <div className="project-row">
                <button className = "arrowButton" onClick={() => setScrollIndex((prev) => Math.max(prev - 1, 0))}>←</button>
                <div className="projects">
                    {projects.slice(scrollIndex, scrollIndex + maxVisible).map((project) => (
                        <div key={project.id} className="project-box" onClick={() => handleClick(project)}>
                            <h3 className='project-title'>{project.name}</h3>
                            <img className="prev_image" src={profileImage} alt="Profile" />
                            <p>{project.description}</p>
                            <div><p><strong>Start date:</strong> {project.start_date}</p>
                            <p><strong>End date:</strong> {project.end_date}</p></div>
                            
                        </div>
                    ))}
                </div>
                <button className = "arrowButton" onClick={() => setScrollIndex((prev) => 
                Math.min(prev + 1, Math.max(0, projects.length - maxVisible)))}>→</button>

            </div>
        </div>
        
        <Note selectedProject ={selectedProject} setSelectedProject = {setSelectedProject} />
    </>
);


}

export default NoteCards