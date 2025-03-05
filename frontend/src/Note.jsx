import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import profileImage from "./assets/profile.png";
import applyProj from "./ApplicationForm.js";

//css
import "./css/Note.css"
//jsx
import Feedback from "./Feedback.jsx";

function Note({selectedProject, setSelectedProject}){
  
    const navigate = useNavigate();
    const [selectedFeedback, setselectedFeedback] = useState(false);
    const [lastProj, setlastProj] = useState(null);
    const [buttonText, setButtonText] = useState('Apply');

    const [isEditing, setIsEditing] = useState(false); // Toggle edit mode
    const [editedProject, setEditedProject] = useState(selectedProject );
    const [applicants, setApplicants] = useState([]); 
    const [selectedOption, setSelectedOption] = useState("");
    const [applicantStatuses, setApplicantStatuses] = useState({});
    const [error, setError] = useState(null);

    //closes the selected project and opens feedback
    const handleFeedback = () => {
        setlastProj(selectedProject);
        setselectedFeedback(!selectedFeedback);
        setSelectedProject(null);
    };


    // Handle closing the larger box
    const handleClose = () => {
        setSelectedProject(null);
    };

    const handleApply= () =>{
        if(buttonText === "Apply"){
            navigate(`/ApplicationForm`);
            setButtonText("Leave");
        }
        else{
            setButtonText("Apply");
        }
    }

    //go to user profile
    const goToProfile = (owner_netid) => {
        navigate(`/profile/${owner_netid}`);
    }
    ///////////////////////
    const handleUpdate = async () => {
        
        try {
            const response = await fetch(`http://localhost:8000/api/projects/update/${selectedProject.id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedProject),
        });
    
    
            if (!response.ok) {
                const errorMessage = `HTTP error! status: ${response.status}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
    
            const data = await response.json();
            console.log("Server Response:", data);
    
             // Update the selectedProject state with the new data
             setSelectedProject(data);
             
            
        } catch (err) {
            console.error("Error submitting project:", err);
            alert(`Error: ${err.message}`);
            setError(err.message);
        }
    };


    ////////////////
    //edit function
   const toggleEdit = () => {
    if (isEditing) {
        // Save changes to selectedProject
        setSelectedProject(editedProject);
        //updateProject(editedProject);
        console.log("saving");
        handleUpdate();
    } else {
        // Load current project details into edit state
        setEditedProject(selectedProject);
    }
    //save change in here
    
    setIsEditing(!isEditing);
};
       // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProject((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


     // Update applicants when selectedProject changes
     useEffect(() => {
        if (selectedProject) {
           
            const dummyApplicants = [
                { name: selectedProject.Name || "Unknown", status: "Owner", position: "Backend Dev" },
                { name: "Matt", status: "Approved" , position: "Frontend Dev"},
                { name: "Jane Smith", status: "Rejected", position: "UI Designer "},
            ];
            setApplicants(dummyApplicants);
        }
    }, [selectedProject]);


    const handleChange = (event, applicantName) => {
        setApplicantStatuses((prev) => ({
            ...prev,
            [applicantName]: event.target.value, 
        }));
    };
    
   return(
       <>
       
           {/* bigger display - project change */}
           {selectedProject && (
           <div className="project-detail-overlay" >
               <div className="project-detail-box" onClick={(e) => e.stopPropagation()}>
                   <h2 className='title'>{isEditing?
                        (<input type='text' name ="name" value={editedProject.name} onChange={handleInputChange}/>):(selectedProject.name)}
                   </h2>
                   <div className="content">
                       <img className="image" src={profileImage} alt="Profile"  onClick={() => goToProfile(selectedProject.owner_netid)} style={{ cursor: 'pointer'}}/>
                       <div className="info">
                           <p><strong>Name:</strong>{" "}
                                {isEditing ? (<input type="text" name="owner" value={editedProject.owner} onChange={handleInputChange}/>) : 
                                (selectedProject.owner)}
                            </p>

                           <p > <strong>Description:</strong>{" "}
                                    {isEditing ? (<textarea name="description" value={editedProject.description} onChange={handleInputChange}/>) : 
                                    (selectedProject.description)}
                            </p>
                           <p ><strong>Looking for:</strong>{" "}
                                    {isEditing ? (<input type="text" name="looking_for" value={editedProject.looking_for}
                                     onChange={handleInputChange}/>) : 
                                     (selectedProject.looking_for)}
                            </p>
                    
                           <p ><strong>Weekly hours:</strong>{" "}
                                    {isEditing ? (
                                        <input type="text" name="weekly_hours" value={editedProject.weekly_hours} onChange={(e) => setEditedProject((prev) => ({...prev,
                                        skills_required: e.target.value.split(", "), }))}/>
                                    ) : (selectedProject.weekly_hours)}
                            </p>
                           <p ><strong>Category:</strong> {selectedProject.category}</p>

                        <p ><strong>Team:</strong>{applicants.map((app) =>(
                            <>
                            <div className='project-team'>
                                <p>{app.name}</p>
                                <p>{app.position}</p>
                            </div>
                            </>
                         ))}
                         </p>
                       </div>
                   </div>
  
                   <div className="button-container">
                       <button onClick={handleClose}>Close</button>


                       <button onClick={handleFeedback}>Feedback</button>
                      {/* <Link to = "/apply"> */}
                           <button onClick={handleApply}>{buttonText}</button>
                       {/*</Link>*/}
                      
                   </div>
                </div>
                {/*appear only when project owner*/}
                <div className='Project-Manager'>
                    <h2>Project Manager</h2>
                    <div className='applicants'>
                        <h1><u>Applicants</u></h1>
                         {applicants.map((app) =>(
                            <li>{app.name}</li>
                         ))}
                    </div>

                    <div className='Line'></div>

                    <div className='status'>
                        <h1><u>Status</u></h1>
                        {applicants.map((app) => (
                             <select
                             value={applicantStatuses[app.name] || ""}
                             onChange={(event) => handleChange(event, app.name)}>
                             <option value="">Select an option</option>
                             <option value="Approved">Approved</option>
                             <option value="Rejected">Rejected</option>
                             <option value="Pending">Pending</option>
                         </select>
                          
                        ))}
                    </div>
                    <div className='buttons'>
                        <button className='edit-proj' onClick={toggleEdit}>{isEditing ? "Save" : "Edit"}</button>
                        <button>Remove</button>
                    </div>
               </div>
           </div>
           )}
           <Feedback setselectedFeedback = {setselectedFeedback} selectedFeedback={selectedFeedback} setSelectedProject ={setSelectedProject} lastProj = {lastProj}/>
       </>
   );


}


export default Note;