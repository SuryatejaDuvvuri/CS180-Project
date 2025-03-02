import React, {useState} from 'react';

//css 
import "./css/Feedback.css"
function Feedback({setselectedFeedback, selectedFeedback, setSelectedProject, lastProj}){

    const closeFeedback = () => {
        setselectedFeedback(false);
        setSelectedProject(lastProj)
    } 

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(values);
        closeFeedback();
    }

    //Form variables
    const [values, setValues] = useState({
        firstname: '',
        lastname: '',
        email: '',
        feedback: ''
    });

    const handleChanges = (e) =>{
        
        setValues({...values, [e.target.name]:[e.target.value]})
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
                        <textarea name="feedback" id="Feedback" cols ="30" row = "10" placeholder="Feedback for Project" onChange ={(e)=>handleChanges(e)} required></textarea>

                        <button className='submit'>submit</button>
                    </form>
                    
                    
                </div>
            </div>)}


        </>
    );

}
export default Feedback; 