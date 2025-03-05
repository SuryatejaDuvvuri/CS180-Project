import React, { useState, useEffect } from 'react';

import profileImage from './assets/profile.png';

//css 
import './css/NoteCards.css';
//jsx
import Note from "./Note.jsx"

function NoteCards({items = [], category}){

    
    const [projects, setProjects] = useState(items);
    const [selectedProject, setSelectedProject] = useState(null);
    const [scrollIndex, setScrollIndex] = useState(0);
    const maxVisible = 5; // Number of visible notes
    
    //part of api endpoint (testing) 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiprojects, setapiProjects] = useState(null);


    // Handle clicking on a preview box
    const handleClick = (project) => {
    setSelectedProject(project);
    };
/*
    const updateProject = (updatedProject) => {
        // Update the projects state
        setProjects((prevProjects) =>
            prevProjects.map((proj) =>
                proj.id === updatedProject.id ? updatedProject : proj
            )
        );
        setSelectedProject(updatedProject); // Ensure selectedProject is also updated
    };
*/

    useEffect(() => {
        fetchRecommendedProjects();
    }, []);

const fetchRecommendedProjects = async () => {
    try{
        const response = await fetch(`http://localhost:8000/api/projects/`, {
        method: 'GET',
        headers: { 'Content-Type' : 'application/json'}
        });
        if (!response.ok) {
            throw new Error("Projects not found");
            
        }
        console.log("IT WORKED ");
        const data = await response.json();
        console.log(data);//check the data coming in(delete later)
        setProjects(data);
    }
    catch(err){
        setError(err.message);
        console.error("Error fetching recommended projects:", err);
    }
    finally{
        setLoading(false);
    }
}
    

return(
    <>
        <div className="category-row">
            {/* Row of clickable boxes */}
            <h1 className='category'>{category}</h1>
            <div className="project-row">
                <button className = "arrowButton" onClick={() => setScrollIndex((prev) => Math.max(prev - 1, 0))}>←</button>
                <div className="projects">
                    {projects.slice(scrollIndex, scrollIndex + maxVisible).map((project) => (
                        <div key={project.id} className="project-box" onClick={() => handleClick(project)}>
                            <h3 className='project-title'>{project.owner}</h3>
                            <img className="prev_image" src={profileImage} alt="Profile" />
                            <p>{project.summary}</p>
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