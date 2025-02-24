import React, {useState, useEffect} from 'react';


function ProjectManagement() {

    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editProj, setEditProj] = useState(null);
    const [showForm, setShowForm] = useState(false);
  
    const getProjects = async () => {
        setLoading(true);
        try
        {
            const response = await fetch("http://localhost:8000/api/projects/", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                },
            });

            if(response.ok)
            {
                const data = await response.json();
                setProjects(Array.isArray(data) ? data: data.results || []);
            }
            else
            {
                throw new Error("Failed to fetch projects");
            }
        }
        catch(err)
        {
            setError(err.message);
            console.error("Error fetching projects:", err);
        } 
        finally
        {
            setLoading(false);
        }
        
    }

    // const addProject = async (projectData) =>
    // {
    //     try
    //     {
    //         const response = await fetch("http://localhost:8000/api/projects/", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({
    //                 name: projectData.name,
    //                 description: projectData.description,
    //                 start_date: projectData.start_date,
    //                 end_date: projectData.end_date,
    //                 no_of_people: Number(projectData.no_of_people),
    //                 category: projectData.category,
    //                 image_url: projectData.img_url,
    //                 weekly_hours: Number(projectData.weekly_hours),
    //                 color: projectData.color,
    //                 authors:[1],
    //             }),
    //         });
    //         const newProject = await response.json();
    //         console.log("New project added: ", newProject);
    //         if(response.ok)
    //         {
    //             setProjects([...projects, newProject]);
    //         }
    //         else
    //         {
    //             console.error("Backend error.");
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //     }
    //     catch(err)
    //     {
    //         console.log(err);
    //         setError(err.message);
    //     }
    // };

    const deleteProj = async (id) =>
    {
        try
        {
            const response = await fetch(`http://localhost:8000/api/projects/${id}/`, {
                method: 'DELETE'
            });

            if (response.ok)
            {
                setProjects(projects.filter((project) => project.id !== id));
            }
        }
        catch(err)
        {
            console.log(err);
            setError(err.message);
        } 
    };

    const handleFormSubmit = async(project) => {
        const method = editProj ? "PUT" : "POST";
        const url = editProj ? `http://localhost:8000/api/projects/${editProj.id}/`
        : "http://localhost:8000/api/projects/";
        try
        {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(project),
            });
            const newProject = await response.json();
            console.log("New project added: ", newProject);
            if(response.ok)
            {
                if(editProj)
                {
                    setProjects(projects.map((project) => project.id === editProj.id ? newProject : project))
                }
                else
                {
                    setProjects([...projects, newProject]);
                }

                setShowForm(false);
                setEditProj(null);
               
            }
            else
            {
                console.error("Backend error.");
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        catch(err)
        {
            console.log(err);
            setError(err.message);
        }
        
    }

    // const updateProj = async (id, updatedProject) =>
    // {
    //     try
    //     {
    //         const response = await fetch(`http://localhost:8000/api/projects/${id}/`, {
    //             method: 'PUT',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(updatedProject),
    //         });
    //         const newProject =  await response.json();
    //         if (response.ok)
    //         {
    //           setProjects(projects.map((project) => project.id === id ? newProject : project))
    //         }
    //         else
    //         {
    //             console.error("Backend Error:");
    //             throw new Error("Failed to update project.");
    //         }
    //     }
    //     catch(err)
    //     {
    //         console.log(err)
    //     } 
    // };

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
                        <button onClick={() => {setEditProj(project); setShowForm(true); }}>Edit</button>
                    </div>
                ))
            ) : (
                <p>No projects are listed.</p>
            )}
                <div className = "buttons">
                        <button onClick = {getProjects}>Refresh</button>
                        <button onClick={() => { setEditProj(null); setShowForm(true); }}>Add Project</button>
                           
                </div>  
            </div>
        )}

        {showForm && (
            <ProjectForm project={editProj} submit = {handleFormSubmit} cancel={()=> {
                setShowForm(false);
                setEditProj(null);
            }}/>
        )}
    </div>
    );

}

const ProjectForm = ({project, submit, cancel}) => {
  const [formData, setFormData] = useState(
      project || {
          name: "",
          description: "",
          start_date: "",
          end_date: "",
          no_of_people: 1,
          category: "",
          image_url: "",
          weekly_hours: 0,
          color: "",
      }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(formData);
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:value,
    }));
  };

  return (
    <div className = "modal">
        <h2>{project ? "Edit Project" : "Add Project"}</h2>
        <form onSubmit = {handleSubmit}>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Project Name" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
          <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
          <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
          <input type="number" name="no_of_people" value={formData.no_of_people} onChange={handleChange} placeholder="Team Size" required />
          <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category" required />
          <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="Image URL" />
          <input type="number" name="weekly_hours" value={formData.weekly_hours} onChange={handleChange} placeholder="Weekly Hours" required />
          <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="Color" />

          <div className = "buttons">
            <button type = "submit">{project ? "Update" : "Add"}</button>
            <button type = "button" onClick = {cancel}>Cancel</button>
          </div>
        </form>
    </div>
  );



};

export default ProjectManagement;