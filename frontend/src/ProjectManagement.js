import React, {useState, useEffect} from 'react';
import { v4 as uuidv4 } from 'uuid';

function ProjectManagement() {

    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const id = uuidv4();
    const getProjects = async () => {
        setLoading(true);
        try
        {
            const response = await fetch('http://localhost:8000/api/projects/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                },
            });

            if(response.ok)
            {
                const data = await response.json();
                setProjects(Array.isArray(data) ? data: data.results || []);
                setLoading(false);
            }
        }
        catch(err)
        {
            setError(err.message);
        } 
        finally
        {
            setLoading(false);
        }
        
    }

    const addProject = async (projectData) =>
    {
        try
        {
            const response = await fetch(`http://localhost:8000/api/projects/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: projectData.name,
                    description: projectData.description,
                    startDate: projectData.start_date,
                    endDate: projectData.end_date,
                    noOfPeople: Number(projectData.no_of_people),
                    category: projectData.category,
                    image_url: projectData.img_url,
                    weeklyHours: Number(projectData.weekly_hours),
                    color: projectData.color,
                    // authors:[1],
                }),
            });
            const newProject = await response.json();
            console.log(newProject);
            if(response.ok)
            {
                setProjects([...projects, newProject]);
            }
            else
            {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        catch(err)
        {
            console.log(err)
        }
    };

    const deleteProj = async (id) =>
    {
        try
        {
            const response = await fetch(`http://localhost:8000/api/projects/${id}`, {
                method: 'DELETE'
            })

            if (response.ok)
            {
                setProjects(projects.filter((project) => project.id !== id))
            }
        }
        catch(err)
        {
            console.log(err)
            setError(err.message)
        } 
    };

    const updateProj = async (id, updatedProject) =>
    {
        try
        {
            const response = await fetch(`http://localhost:8000/api/projects/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProject)
            })

            if (response.ok)
            {
              const newProject =  await response.json();
              setProjects(projects.map((project) => project.id === id ? newProject : project))
            }
        }
        catch(err)
        {
            console.log(err)
        } 
    };

    useEffect(() => {
        getProjects();
    }, []);

    return (
    <div className="ProjectManagement">
        <h1>Project Management</h1>
        {error && <p style = {{color: 'red'}}>{error}</p>}
        {loading ? (<p>Loading...</p>) :
        (
            <div className = "list">
                {Array.isArray(projects) && projects.length > 0 ? (
                    projects.map((project) => (
                    <div key = {project.id} className = "project">
                        <h3>{project.name}</h3>
                        <p>{project.description}</p>
                        <p>{project.startDate}</p>
                        <p>{project.endDate}</p>
                        <p>{project.noOfPeople}</p>
                        <p>{project.category}</p>
                        <p>{project.img_url}</p>
                        <p>{project.weeklyHours}</p>
                        <p>{project.color}</p>
                        <button onClick = {() => deleteProj(project.id)}>Delete</button>
                            <button onClick={() => updateProj(project.id, {
                                ...project, name: `${project.name} is updated`
                            })} className="update">Update</button>
                    </div>
                ))
            ) : (
                <p>No projects are listed.</p>
            )}

                <div className = "buttons">
                        <button onClick = {getProjects}>Refresh</button>
                        <button onClick = {() => addProject({
                            name: "New Project",
                            description: "New Project Description",
                            start_date: "2021-01-01",
                            end_date: "2021-12-01",
                            no_of_people: 5,
                            category: "Computer Science",
                            img_url: 'https://www.freepik.com/free-vector/abstract-technology-background_5264211.html',
                            weekly_hours: 40,
                            color: "red",
                            // authors: [1]
                        })}>
                            Add
                        </button>
                           
                </div>  
            </div>
        )


        }
    </div>
    );

}

export default ProjectManagement;