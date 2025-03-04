import React, {useState} from 'react';

//css 
import "./css/Feedback.css"
function Feedback({setselectedFeedback, selectedFeedback, setSelectedProject, lastProj}){

    const closeFeedback = () => {
        setselectedFeedback(false);
        setSelectedProject(lastProj)
    } 

    /* Before submitting, update the form data one last time to ensure there are no lagged inputs.
       First, check to make sure there are no input errors. We check each input individually.
       If there are no errors, submit the form. Otherwise, update the display to show the errors.
    */
    const handleSubmit = (e) => {
        //setValues({ ...values, [e.target.name]: e.target.value });
        checkFName(e);
        checkLName(e);
        checkEmail(e);
        checkFeedback(e);

        e.preventDefault();
        console.log(values);
        // If there are no errors, close the tab and send the alert
        if(!(valueError.fNameError || valueError.lNameError || valueError.emailError || valueError.feedbackError))
        {
            closeFeedback();
            alert('Form submitted');
        }
    }

    //Form variables
    const [values, setValues] = useState({
        firstname: '',
        lastname: '',
        email: '',
        feedback: ''
    });
        
    // I didn't end up using the setValueError function because I wasn't sure how to use it
    const [valueError, setValueError] = useState({
        fNameError: false,
        lNameError: false,
        emailError: false,
        emailReqError: false,
        emailInvalidError: false,
        feedbackError: false,
    });

    const handleChanges = (e) =>{
        
        setValues({...values, [e.target.name]:[e.target.value]})
    }

    //If firstname input is filled, there is no error (nameError = false)
    const checkFName = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
        valueError.fNameError = values.firstname == '' ? true : false;
    };

    //If lastname input is filled, there is no error (nameError = false)
    const checkLName = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
        valueError.lNameError = values.lastname == '' ? true : false;
    };
    
    //If email input is empty, we get a requirement error (emailError = true)
    //Since we use type='email', it will automatically check for us if the email is valid or not
    const checkEmail = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
        valueError.emailError = values.email == '' ? true : false;
    }

    //If feedback input is filled, there is no error (nameError = false)
    const checkFeedback = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
        valueError.feedbackError = values.feedback == '' ? true : false;
    };


    // HACK: I made a border style for each of the inputs because I couldn't hardcode it straight into the html
   const fNameDisplayStyle = {
        display: valueError.fNameError ? "flex" : "none",
    }
    const lNameDisplayStyle = {
        display: valueError.lNameError ? "flex" : "none",
    }
    const emailDisplayStyle = {
        display: valueError.emailError ? "flex" : "none",
    }
    const feedbackDisplayStyle = {
        display: valueError.feedbackError ? "flex" : "none",
    }
    
    
    return(
        <>
            {selectedFeedback &&( 
            <div className = "Feedback-overlay">
                <div className="Feedback-container">
                    {/*Exit button*/}
                    <div className="exit"><button  onClick={closeFeedback}>x</button></div>
                    
                    {/*Header*/}
                    <h1>Feedback Form</h1>

                    <form className= "form" onSubmit={handleSubmit}>
                        {/*First name input*/}
                        <label htmlFor="firstname">First Name*</label>
                        <input  
                            className={valueError.fNameError ? "form-input error-input" : "form-input"}
                            name ="firstname" type="text"
                            id = "firstname"
                            placeholder='Enter first Name'
                            onChange ={(e)=>handleChanges(e)}
                        />
                        <div style={fNameDisplayStyle} className='errorLabel' >Required</div>

                        {/*Last name input*/}
                        <label htmlFor="lastname">Last Name*</label>
                        <input
                            className={valueError.lNameError ? "form-input error-input" : "form-input"}
                            name ="lastname"
                            type="text"
                            placeholder='Enter last Name'
                            id = "lastname"
                            onChange ={(e)=>handleChanges(e)}
                        />
                        <div style={lNameDisplayStyle} className='errorLabel' >Required</div>

                        {/*Email input*/}
                        <label htmlFor="email">Email*</label>
                        <input
                            className={valueError.emailError ? "form-input error-input" : "form-input"}
                            type="email"
                            placeholder="Enter Email"
                            name ="email"
                            id="email"
                            onChange ={(e)=>handleChanges(e)}
                        />
                        <div style={emailDisplayStyle} className='errorLabel' >Required</div>
                
                        {/*Feedback input*/}
                        <label htmlFor="Feedback">FeedBack*</label>
                        <textarea
                            className={valueError.feedbackError ? "form-input error-input" : "form-input"}
                            name="feedback"
                            id="Feedback"
                            cols ="30"
                            row = "10"
                            placeholder="Feedback for Project"
                            onChange ={(e)=>handleChanges(e)}
                        />
                        <div style={feedbackDisplayStyle} className='errorLabel' >Required</div>

                        {/*Submit button*/}
                        <button className='submit'>Submit</button>
                    </form>
                </div>
            </div>)}
        </>
    );

}
export default Feedback; 