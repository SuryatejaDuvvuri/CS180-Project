import React, {useState} from 'react';
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


    return (
        <div className="signup">
            <h1>Create an Account</h1>
            <form onSubmit={(e) => {e.preventDefault(); alert("Success");}} className="signup-form">

            <label className="form-label">
                Full Name:
                <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    required
                />
            </label>

            <label className="form-label">
                NetID:
                <input 
                    type="text"
                    value={netId}
                    onChange={(e) => setNetId(e.target.value)}
                    className="form-input"
                    required
                    placeholder="e.g. abc123"
                />
            </label>

            <label className="form-label">
                Skills:
                <input 
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="form-input"
                    required
                     placeholder="e.g. React, Python, etc."
                />
            </label>

            <label className="form-label">
                Pronouns:

                <input
                    type="text"
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    className="form-input"
                    required
                    placeholder='e.g. she/her, he/him, they/them'
                />
            </label>

            <label className="form-label">
                Resume Link:
                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    className="form-input"
                />
            </label>

            <label className="form-label">
                Interests:
                <input 
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="form-input"
                    required
                />
            </label>

            <label className="form-label">
                Experience:
                <input 
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="form-input"
                    required
                />
            </label>


            <label className="form-label">
                Location:
                <input 
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="form-input"
                    required
                    placeholder="City, State or general area"
                />
            </label>
            
            <label className="form-label">
                Weekly Time Commitment (hours):
                <input 
                    type="number"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(e.target.value)}
                    className="form-input"
                    required
                />
            </label>
            <label className="form-label">
                Password:
                <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    required
                />
            </label>
            <label className="form-label">
                Confirm Password:
                <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    required
                />
            </label>

            
            <input type="submit" value="Submit" className="form-submit"/>

               
            </form>
        </div>
    )

}

export default Signup;