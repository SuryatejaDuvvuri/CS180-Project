import React, { useState } from 'react';
import './Signup.css';

function Signup() {

    const [name, setName] = useState('');
    const [netId, setNetId] = useState('');
    const [skills, setSkills] = useState('');
    const [pronouns, setPronouns] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [interests, setInterests] = useState('');
    const [experience, setExperience] = useState('');
    const [location, setLocation] = useState('');
    const [weeklyHours, setWeeklyHours] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    
    
    const [accountData, setAccountData] = useState({
        name: '',
        netId: '',
        skills: '',
        pronouns: '',
        resumeFile: '',
        interests: '',
        experience: '',
        location: '',
        weeklyHours: '',
        password: '',
        confirmPassword: '',
    });
    
    // I didn't end up using the setAccountError function because I wasn't sure how to use it
    const [accountError, setAccountError] = useState({
        nameError: false,
        netIdError: false,
        skillsError: false,
        pronounsError: false,
        resumeError: false,
        resumeChanged: false,
        interestsError: false,
        expError: false,
        locationError: false,
        weeklyHoursError: false,
        psError: false,
        confirmPsError: false,
        matchingPsError: false,
    });

    const handleChange = (e) => {
        setAccountData({ ...accountData, [e.target.name]: e.target.value });
    }

    const handleSubmit = (e) => {
        setAccountData({ ...accountData, [e.target.name]: e.target.value });
        checkName(e);
        checkNetId(e);
        checkSkills(e);
        checkPronouns(e);
        checkResume(e);
        checkInterests(e);
        checkExperience(e);
        checkLocation(e);
        checkWeeklyTime(e);
        checkPassword(e);

        e.preventDefault();
        if(!(accountError.nameError || accountError.netIdError || accountError.skillsError || accountError.pronounsError || accountError.resumeError || accountError.interestsError || accountError.expError || accountError.locationError || accountError.weeklyHoursError || accountError.psError))
            alert("Form submitted");
    }

    //If name input is filled, there is no error (nameError = false)
    const checkName = (e) => {
        setAccountData({ ...accountData, [e.target.name]: e.target.value });
        accountError.nameError = accountData.name == '' ? true : false;
    };

    //If netId input is filled, there is no error (netIdError = false)
    const checkNetId = (e) => {
        setAccountData({ ...accountData, [e.target.name]: e.target.value });
        accountError.netIdError = accountData.netId == '' ? true : false;
    };

    //If skills input is filled, there is no error (skillsError = false)
    const checkSkills = (e) => {
        setAccountData({ ...accountData, [e.target.name]: e.target.value });
        accountError.skillsError = accountData.skills == '' ? true : false;
    };

    //If pronouns input is filled, there is no error (pronounsError = false)
    const checkPronouns = (e) => {
        setAccountData({ ...accountData, [e.target.name]: e.target.value });
        accountError.pronounsError = accountData.pronouns == '' ? true : false;
    };

    // Sets resumeError to !resumeChanged.
    // resumeChanged only turns to true once the user adds a file to the input.
    // If resumeChanged is true, then there should be no error, meaning resumeError = false.
    // If resumeChanged is false, then there is an error, meaning resumeError = true.
    const checkResume = (e) => {
        accountError.resumeError = !accountError.resumeChanged;
    };

    //If interests input is filled, there is no error (interestsError = false)
    const checkInterests = (e) => {
        setAccountData({ ...accountData, [e.target.name]: e.target.value });
        accountError.interestsError = accountData.interests == '' ? true : false;
    };

    //If experience input is filled, there is no error (expError = false)
    const checkExperience = (e) => {
        setAccountData({ ...accountData, [e.target.name]: e.target.value });
        accountError.expError = accountData.experience == '' ? true : false;
    };

    //If location input is filled, there is no error (locationError = false)
    const checkLocation = (e) => {
        setAccountData({ ...accountData, [e.target.name]: e.target.value });
        accountError.locationError = accountData.location == '' ? true : false;
    };

    //If weeklyHours input is filled, there is no error (weeklyHoursError = false)
    const checkWeeklyTime = (e) => {
        setAccountData({ ...accountData, [e.target.name]: e.target.value });
        accountError.weeklyHoursError = accountData.weeklyHours == '' ? true : false;
    };

    //If password input is filled, there is no error for the first input (psError = false
    //If confirmPassword input is filled, there is no error for the second input (confirmPsError = false
    //If both password inputs match, there is no error (matchingPsError = false)
    const checkPassword = (e) => {
        setAccountData({ ...accountData, [e.target.name]: e.target.value });
        accountError.psError = accountData.password == '' ? true : false;
        accountError.confirmPsError = accountData.confirmPassword == '' ? true : false;
        
        if(accountError.psError || accountError.confirmPsError)
            accountError.matchingPsError = false;
        else
            accountError.matchingPsError = accountData.password != accountData.confirmPassword ? true : false;
    };



    const nameDisplayStyle = {
        display: accountError.nameError ? "flex" : "none",
    }
    const netIdDisplayStyle = {
        display: accountError.netIdError ? "flex" : "none",
    }
    const skillsDisplayStyle = {
        display: accountError.skillsError ? "flex" : "none",
    }
    const pronounsDisplayStyle = {
        display: accountError.pronounsError ? "flex" : "none",
    }
    const resumeDisplayStyle = {
        display: accountError.resumeError ? "flex" : "none",
    }
    const interestsDisplayStyle = {
        display: accountError.interestsError ? "flex" : "none",
    }
    const expDisplayStyle = {
        display: accountError.expError ? "flex" : "none",
    }
    const locationDisplayStyle = {
        display: accountError.locationError ? "flex" : "none",
    }
    const weeklyHoursDisplayStyle = {
        display: accountError.weeklyHoursError ? "flex" : "none",
    }
    const psDisplayStyle = {
        display: accountError.psError ? "flex" : "none",
    }
    const confirmPsDisplayStyle = {
        display: accountError.confirmPsError ? "flex" : "none",
    }
    const matchingPsDisplayStyle = {
        display: accountError.matchingPsError ? "flex" : "none",
    }

    return (
        <div className="signup">
            <form onSubmit={handleSubmit} className="signup-form">
                <h1>Create an Account</h1>

                {/*Name input*/}
                <label className="form-label">
                    Full Name:
                    <input
                        type="text"
                        name="name"
                        value={accountData.name}
                        onChange={handleChange}
                        className={accountError.nameError ? "form-input error-input" : "form-input"}
                    />
                    <div style={nameDisplayStyle} className='errorLabel' >Required</div>
                </label>

                <label className="form-label">
                    NetID:
                    <input
                        type="text"
                        name="netId"
                        value={accountData.netId}
                        onChange={handleChange}
                        className={accountError.netIdError ? "form-input error-input" : "form-input"}
                        placeholder="e.g. abc123"
                    />
                    <div style={netIdDisplayStyle} className='errorLabel' >Required</div>
                </label>

                <label className="form-label">
                    Skills:
                    <input
                        type="text"
                        name="skills"
                        value={accountData.skills}
                        onChange={handleChange}
                        className={accountError.skillsError ? "form-input error-input" : "form-input"}
                        placeholder="e.g. React, Python, etc."
                    />
                    <div style={skillsDisplayStyle} className='errorLabel' >Required</div>
                </label>

                <label className="form-label">
                    Pronouns:
                    <input
                        type="text"
                        name="pronouns"
                        value={accountData.pronouns}
                        onChange={handleChange}
                        className={accountError.pronounsError ? "form-input error-input" : "form-input"}
                        placeholder='e.g. she/her, he/him, they/them'
                    />
                    <div style={pronounsDisplayStyle} className='errorLabel' >Required</div>
                </label>

                <label className="form-label">
                    Resume Link:
                    <input
                        type="file"
                        name="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                            setResumeFile(e.target.files[0]);
                            accountError.resumeChanged = true;
                        }}
                        className={accountError.resumeError ? "form-input error-input" : "form-input"}
                    />
                    <div style={resumeDisplayStyle} className='errorLabel' >File required</div>
                </label>

                <label className="form-label">
                    Interests:
                    <input
                        type="text"
                        name="interests"
                        value={accountData.interests}
                        onChange={handleChange}
                        className={accountError.interestsError ? "form-input error-input" : "form-input"}
                    />
                    <div style={interestsDisplayStyle} className='errorLabel' >Required</div>
                </label>

                <label className="form-label">
                    Experience:
                    <input
                        type="text"
                        name="experience"
                        value={accountData.experience}
                        onChange={handleChange}
                        className={accountError.expError ? "form-input error-input" : "form-input"}
                    />
                    <div style={expDisplayStyle} className='errorLabel' >Required</div>
                </label>


                <label className="form-label">
                    Location:
                    <input
                        type="text"
                        name="location"
                        value={accountData.location}
                        onChange={handleChange}
                        className={accountError.locationError ? "form-input error-input" : "form-input"}
                        placeholder="City, State or general area"
                    />
                    <div style={locationDisplayStyle} className='errorLabel' >Required</div>
                </label>

                <label className="form-label">
                    Weekly Time Commitment (hours):
                    <input
                        type="number"
                        name='weeklyHours'
                        value={accountData.weeklyHours}
                        onChange={handleChange}
                        className={accountError.weeklyHoursError ? "form-input error-input" : "form-input"}
                        min = "1" 
                    />
                    <div style={weeklyHoursDisplayStyle} className='errorLabel' >Required</div>
                </label>
                <label className="form-label">
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={accountData.password}
                        onChange={handleChange}
                        className={accountError.psError || accountError.matchingPsError ? "form-input error-input" : "form-input"}
                    />
                    <div style={psDisplayStyle} className='errorLabel' >Required</div>
                </label>
                <label className="form-label">
                    Confirm Password:
                    <input
                        type="password"
                        name="confirmPassword"
                        value={accountData.confirmPassword}
                        onChange={handleChange}
                        className={accountError.confirmPsError || accountError.matchingPsError ? "form-input error-input" : "form-input"}
                    />
                    <div style={confirmPsDisplayStyle} className='errorLabel' >Required</div>
                    <div style={matchingPsDisplayStyle} className='errorLabel' >Passwords do not match</div>
                </label>


                <input type="submit" value="Submit" className="submit-button" />


            </form>
        </div>
    )

}

export default Signup;