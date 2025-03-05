import React, { useState } from "react";
import './ProjectCreation.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {auth} from "./firebase";

function ProjectCreation() {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [range, setRange] = useState([null, null]);
    const [startDate, endDate] = range;
    const [val, setVal] = useState(0);
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [weeklyHours, setWeeklyHours] = useState(0);
    const [image, setImage] = useState(null);
    const [color, setColor] = useState(null);
    const colorOptions = ['red','orange','yellow','green','blue','purple'];

    const handleSubmit = async (e) => 
    {
        e.preventDefault();
        setError(null);

        const user = auth.currentUser;
        if (!user) 
        {
            setError("You need to be logged in to create a project.");
            return;
        }

        if (!name || !desc || !category) 
        {
          setError("Please fill all required fields.");
          return;
        }

        try
        {
            const idToken = await user.getIdToken();
            const response = await fetch("http://localhost:8000/api/projects/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify(projectData),
            });

          
            const project = {
              name:name,
              description: desc,
              owner: auth.currentUser.name,
              start_date: startDate ? startDate.toISOString() : null,
              end_date: endDate ? endDate.toISOString() : null,
              no_of_people: val,
              lookingFor:lookingFor,
              category:category,
              location:location,
              weekly_hours: weeklyHours,
              color:color,
              image_url: image ? URL.createObjectURL(image) : null, 
          };
          
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to create project.");
            }

            alert("Project created successfully!");
        }
        catch (err) 
        {
            setError(err.message);
            console.error("Error creating project:", err);
        }

    }
     
    return (
        <div className="ProjectCreation">
             <br/>
            
                  <h1>New Project</h1>
                  <form onSubmit={(e) => {e.preventDefault(); alert("Working")} } className = "form-container">
            
                    <label className="form-label">Project Image: 
                      <input type = "file" onChange={(e) => setImage(e.target.files[0])} className="form-input"/>
                      {image && (
                        <div className="file-info">
                          <strong>Selected:</strong> {image.name}
                        </div>
                      )}
                    </label>
            
                    <div className="form-label">
                      <span>Color:</span>
                      <div className="color-row">
                        {colorOptions.map((c) => (
                          <div 
                            key={c}
                            onClick={() => setColor(c)}
                            className={`color-circle ${color === c ? 'selected' : ''}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
            
            
            
                    <label name = "name" className="form-label"> 
                      Project Name: <input type = "text" value = {name} className="form-input" onChange={(e) => setName(e.target.value)}/>
                    </label>
                    <br/>
                    <label className="form-label">
                      <span>Project Description:</span>
                      <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        rows={4}
                        className="form-textarea"
                      />
                    </label>
                    <label>Project Duration:  
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        setRange(update);
                      }}
                      isClearable={true}
                    />
                    </label>
                    <label>Number of people: <input type="number" value = {val} onChange = {(e) => setVal(e.target.value)} className="form-input"/></label>
                    <label className="form-label">
                    Categories:
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input">
                            <option value="">Select a category</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Medicine">Medicine</option>
                            <option value="Filmmaking">Filmmaking</option>
                            <option value="Art">Art</option>
                            <option value="Psychology">Psychology</option>
                            <option value="History">History</option>
                        </select>
                    </label>

                    <label>Location: <input type = "text" value = {location} onChange = {(e) => setLocation(e.target.value)}/> </label>
                    <label className="form-label">Weekly Time Commitment (hours): 
                      <input 
                        type="number" 
                        min="1" 
                        max="168" 
                        value={weeklyHours} 
                        onChange={(e) => setWeeklyHours(e.target.value)}
                      />
                    </label>
                    <br/>        
                    <input type = "submit" value = "Submit" onSubmit={handleSubmit}/>
                  </form>
        </div>
    );
}
export default ProjectCreation;
