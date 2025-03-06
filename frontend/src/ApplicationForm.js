import React, { useState } from 'react';
import './ApplicationForm.css';
import './css/Colors.css';

const ApplicationForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        position: '',
        resume: '',
    });
    
    // I didn't end up using the setFormError function because I wasn't sure how to use it
    const [formError, setFormError] = useState({
        nameError: false,
        emailError: false,
        emailReqError: false,
        emailInvalidError: false,
        phoneError: false,
        phoneReqError: false,
        phoneInvalidError: false,
        positionError: false,
        resumeError: false,
        resumeChanged: false
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /* Before submitting, update the form data one last time to ensure there are no lagged inputs.
       First, check to make sure there are no input errors. We check each input individually.
       If there are no errors, submit the form. Otherwise, update the display to show the errors.
    */
    const handleSubmit = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        checkName(e);
        checkEmail(e);
        checkPhone(e);
        checkPosition(e);
        checkResume(e);

        e.preventDefault();
        console.log(formData);
        // If there are no errors, send the alert
        if(!(formError.nameError || formError.emailError || formError.phoneError || formError.positionError || formError.resumeError))
            alert('Form submitted');
    };

    //If name input is filled, there is no error (nameError = false)
    const checkName = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        formError.nameError = formData.name == '' ? true : false;
    };
    
    //If email input is empty, we get a requirement error (emailError = true)
    //Since we use type='email', it will automatically check for us if the email is valid or not
    const checkEmail = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        //formError.emailReqError = formData.email == '' ? true : false;
        //formError.emailInvalidError = checkEmailInvalidError(formData.email);
        
        //formError.emailError = formError.emailReqError || formError.emailInvalidError;
        formError.emailError = formData.email == '' ? true : false;
    }
    // Returns true if there is an error
    function checkEmailInvalidError(email)
    {
        if(formError.emailReqError)
            return false;
        //check @ is included
        if(email.includes('@'))
        {
            //checks if @ is at the very beginning/end of string
            if(email.indexOf('@') != 0 && email.indexOf('@') != email.length-1)
            {
                //checks that "@." and ".@" don't occur
                //also makes sure "." doesn't appear at very beginning/end of string
                //makes sure a "." exists after the @ somewhere

                //var emailFirstHalf = email.substring(0, email.indexOf('@'));
                var emailSecondHalf = email.substring(email.indexOf('@') + 1);
                if(!email.includes('@.') && !email.includes('.@') && email.indexOf('.') != 0 && emailSecondHalf.includes('.') && email.indexOf('.') != email.length-1)
                    return false;
            }
        }
        return true;
    }

    //If phone input is empty, we get a requirement error (phoneError = true, phoneReqError = true, phoneInvalidError = false)
    //If phone input is filled out, but phone is invalud, we get an invalid error  (phoneError = true, phoneReqError = false, phoneInvalidError = true)
    //Otherwise, there is no error (all values = false)
    const checkPhone = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        formError.phoneReqError = formData.phone == '' ? true : false;
        formError.phoneInvalidError = checkPhoneLength(formData.phone);
        
        formError.phoneError = formError.phoneReqError || formError.phoneInvalidError;
    }
    // Returns true if there is an error
    function checkPhoneLength(phone) {
        if(formError.phoneReqError)
            return false;

        //shaves string down until it only contains numbers and letters
        var phoneNum = phoneRemoveSpecialChar(phone);

        //checks that the string is only made up of 10 digits
        if(phoneNum.length == 10 && !isNaN(phoneNum))
            return false;
        return true;
    }
    function phoneRemoveSpecialChar(phone) {
        var phoneNum = "";
        for(var i = 0; i < phone.length; i++)
        {
            if(!isSpecialCharacter(phone.charAt(i)))
                phoneNum = phoneNum + phone.charAt(i);
        }
        return phoneNum;
    }
    // Possible extra characters: (, ), -, /, ., [space]
    function isSpecialCharacter(c)
    {
        return c == "(" || c == ")" || c == "-" || c == "/" || c == "\\" || c == "." || c == " ";
    }

    //If position input is filled, there is no error (positionError = false)
    const checkPosition = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        formError.positionError = formData.position == '' ? true : false;
    };

    // Sets resumeError to !resumeChanged.
    // resumeChanged only turns to true once the user adds a file to the input.
    // If resumeChanged is true, then there should be no error, meaning resumeError = false.
    // If resumeChanged is false, then there is an error, meaning resumeError = true.
    const checkResume = (e) => {
        formError.resumeError = !formError.resumeChanged;
    };

    // HACK: I made a border style for each of the inputs because I couldn't hardcode it straight into the html
    const nameDisplayStyle = {
        display: formError.nameError ? "flex" : "none",
    }
    const emailDisplayStyle = {
        display: formError.emailError ? "flex" : "none",
    }
    const emailInvalidDisplayStyle = {
        display: formError.emailInvalidError ? "flex" : "none",
    }
    const phoneReqDisplayStyle = {
        display: formError.phoneReqError ? "flex" : "none",
    }
    const phoneInvalidDisplayStyle = {
        display: formError.phoneInvalidError ? "flex" : "none",
    }
    const positionDisplayStyle = {
        display: formError.positionError ? "flex" : "none",
    }
    const resumeDisplayStyle = {
        display: formError.resumeError ? "flex" : "none",
    }



    return (
        <div className="form-container">
            <div className='formTitle'>Application Form</div>
            <form onSubmit={handleSubmit}>
                {/*Name input*/}
                <h1>Feedback Form</h1>
                <label className="form-label">Full name: 
                <input 
                    className={formError.nameError ? "input-field error-input" : "input-field"}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name" /><br />
                <div style={nameDisplayStyle} className='errorLabel' >Required</div>
                </ label>

                {/*Email input*/}
                <label className="form-label">Email: 
                <input 
                    className={formError.emailError ? "input-field error-input" : "input-field"}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email" /><br />
                <div style={emailDisplayStyle} className='errorLabel' >Required</div>
                </ label>

                {/*Phone number input*/}
                <label className="form-label">Phone number:
                <input 
                    className={formError.phoneError ? "input-field error-input" : "input-field"}
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone" /><br />
                <div style={phoneReqDisplayStyle} className='errorLabel' >Required</div>
                <div style={phoneInvalidDisplayStyle} className='errorLabel' >Invalid phone number</div>
                </ label>

                {/*Position input*/}
                <label className="form-label">Position:
                <input 
                    className={formError.positionError ? "input-field error-input" : "input-field"}
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Position" /><br />
                <div style={positionDisplayStyle} className='errorLabel' >Required</div>
                </ label>

                {/*Resume input*/}
                <label className="form-label">Resume:
                <div className={formError.resumeError ? "input-field error-input" : "input-field"}>
                    <input className='input-file' type="file"
                    onChange={(event) => formError.resumeChanged = true} /><br />
                </div>
                <div style={resumeDisplayStyle}className='errorLabel' >File required</div>
                </ label>

                {/*Submit button*/}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default ApplicationForm;