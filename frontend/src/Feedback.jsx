import React, {useState, useEffect} from 'react';

//css 
import "./css/Feedback.css"
function Feedback({setselectedFeedback, selectedFeedback, setSelectedProject, lastProj}){
    //useStates
    //const [feedback,setFeedback] = useState([]);
    //const [loading, setLoading] = useState(true);
    //const [error, setError] = useState(null);

    const closeFeedback = () => {
        setselectedFeedback(false);
        setSelectedProject(lastProj)
    } 

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(values);
        sendFeedback(values.email, values.firstname, values.feedback, values.improvements);
        closeFeedback();
    }

    //Form variables
    const [values, setValues] = useState({
        firstname: '',
        lastname: '',
        email: '',
        feedback: '',
        improvements: ''
    });

    const handleChanges = (e) =>{
        
        setValues({...values, [e.target.name]:[e.target.value]})
    }

    const sendFeedback = async (email, name, feedback, improvements) => 
        {
            try
            {
                const response = await fetch("http://localhost:8000/api/feedback", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                        name: name,
                        experiences: feedback,
                        improvements: improvements,
                    }),
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to send email");
                }
            }
            catch (err)
            {
                console.error("Error: ",err);
            }
        }
    
    return(
        <>
            
            {selectedFeedback &&( 
            <div className = "Feedback-overlay">
                <div className="Feedback-container">
                    <div className="exit"><button  onClick={closeFeedback}>x</button></div>
                    
                    <h1>Feedback Form</h1>
                    <form className= "form" onSubmit={handleSubmit}>
                        <label htmlFor="firstname">First Name*</label>
                        <input  name ="firstname" type="text"  id = "firstname" placeholder='Enter first Name' onChange ={(e)=>handleChanges(e)} required/>

                        <label htmlFor="lastname">Last Name*</label>
                        <input name ="lastname" type="text" placeholder='Enter last Name' id = "lastname" onChange ={(e)=>handleChanges(e)} required/>

                        <label htmlFor="email">Email*</label>
                        <input type="email" placeholder="Enter Email" name ="email" id="email" onChange ={(e)=>handleChanges(e)} required/>

                        <label htmlFor="Feedback">FeedBack*</label>
                        <textarea name="feedback" id="Feedback" cols ="30" rows = "10" placeholder="Feedback for Project" onChange ={(e)=>handleChanges(e)} required></textarea>

                        <label htmlFor="Improvments">Improvments*</label>
                        <textarea name="improvements" id="Improvments" cols ="30" rows = "10" placeholder="What needed improvement?" onChange ={(e)=>handleChanges(e)} required></textarea>

                        <button className='submit'>submit</button>
                    </form>
                    
                    
                </div>
            </div>)}


        </>
    );

}
export default Feedback; 