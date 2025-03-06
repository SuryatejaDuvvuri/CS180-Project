import React, { useState, useEffect } from "react";
import './ProjectCreation.css';
import DatePicker from "react-datepicker";
import { useMajors } from "./GetMajors"; 
import "react-datepicker/dist/react-datepicker.css";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function ProjectCreation() {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [range, setRange] = useState([null, null]);
    const [startDate, endDate] = range;
    const [error,setError] = useState(null);
    const [val, setVal] = useState(0);
    const [isLight, setMode] = useState(true);
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [weeklyHours, setWeeklyHours] = useState(0);
    const [image, setImage] = useState(null);
    const [skills, setSkills] = useState([]);
    const [color, setColor] = useState(null);
    const [looking_for, setLooking_for] = useState('');
    const colorOptions = ['red','orange','yellow','green','blue','purple'];
    const navigate = useNavigate();
    const majors = useMajors();
    
    const handleSubmit = async (e) => 
    {
        e.preventDefault();
        setError(null);

        const auth = getAuth();
        const user = auth.currentUser;
      
        console.log(user);
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
            let imageBase64 = null;

            if (image) {
              const fileReader = new FileReader();
              fileReader.readAsDataURL(image);
              await new Promise((resolve) => {
                  fileReader.onloadend = () => {
                      imageBase64 = fileReader.result;
                      resolve();
                  };
              });
          }
          const projectData = {
            name,
            description: desc,
            owner: user.email,
            start_date: startDate ? startDate.toISOString() : null,
            end_date: endDate ? endDate.toISOString() : null,
            no_of_people: val,
            looking_for, 
            category,
            location,
            weekly_hours: weeklyHours,
            color,
            image: imageBase64,  
        };
            const response = await fetch("http://localhost:8000/api/projects/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify(projectData),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to create project.");
            }

            alert("Project created successfully!");
            navigate("/applicants");
        }
        catch (err) 
        {
            setError(err.message);
            console.error("Error creating project:", err);
        }
    }

     useEffect(() => {
            if (isLight) {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("theme", "light");
            } else {
                document.documentElement.classList.add("dark");
                localStorage.setItem("theme", "dark");
            }
        }, [isLight]);

 
     
    return (
        <div className="ProjectCreation">
             <br/>
            
                  <h1>New Project</h1>
                  <form onSubmit={handleSubmit} className = "form-container">
            
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
                    <label name = "name" className="form-label"> 
                      Looking For: <input type = "text" value = {looking_for} className="form-input" onChange={(e) => setLooking_for(e.target.value)}/>
                    </label>
                    <label name = "name" className="form-label"> 
                      Looking For: <input type = "text" value = {skills} className="form-input" onChange={(e) => setSkills(e.target.value)}/>
                    </label>
                    <label>Number of people: <input type="number" value = {val} onChange = {(e) => setVal(e.target.value)} className="form-input"/></label>
                    <label className="form-label">
                    Categories:
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input">
                            <option value="Select a category">Select a category</option>
                            {majors.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
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
                    <div className = "buttons">
                      <button type = "submit">{"Add"}</button>
                      {/* <button type = "button" onClick = {navigate("/home")}>Cancel</button> */}
                    </div>
                </form>
        </div>
    );
}
export default ProjectCreation;
