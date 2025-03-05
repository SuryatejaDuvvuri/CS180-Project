import React, { useState } from 'react';
// import './Signup.css';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmail } from "./firebase";
import { FaGithub, FaLinkedin } from "react-icons/fa";


function Signup() {
    const navigate = useNavigate(); 
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [netId, setNetId] = useState('');
    const [skills, setSkills] = useState('');
    const [pronouns, setPronouns] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [github, setGithub] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [interests, setInterests] = useState('');
    const [experience, setExperience] = useState('');
    const [location, setLocation] = useState('');
    const [weeklyHours, setWeeklyHours] = useState('');
    const [password, setPassword] = useState('');
    const [error,setError] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onloadend = () => {
            console.log("Base64 Resume:", reader.result);
            setResumeFile(reader.result); 
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        console.log(resumeFile);
        const formData = {
            fullname: name,
            email: email,
            net_id: netId,
            resume: resumeFile,
            github:github,
            linkedin: linkedin,
            skills: skills.split(","), 
            pronouns: pronouns,
            interests: interests.split(","),
            experience: experience,
            location: location,
            weekly_hours: parseInt(weeklyHours, 10),
            password: password,
        };

        try {
            const idToken = await signUpWithEmail(email, password);
            if (!idToken) throw new Error("Failed to register user in Firebase");
            const response = await fetch("http://localhost:8000/api/users/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Account created successfully");
                navigate("/home");
            } else {
                const data = await response.json();
                alert(data.error || "Failed to create account");
            }
        } catch (err) {
            alert("Failed to create account");
            console.error("Error:", err);
        }
    }


    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
                <h1 className="text-3xl font-bold text-center mb-6">Create an Account</h1>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-gray-700 font-semibold">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>

          
                    <div>
                        <label className="block text-gray-700 font-semibold">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                            placeholder="e.g. abco45@gmail.com"
                        />
                    </div>

                   
                    <div>
                        <label className="block text-gray-700 font-semibold">NetID</label>
                        <input
                            type="text"
                            value={netId}
                            onChange={(e) => setNetId(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                            placeholder="e.g. abc123"
                        />
                    </div>

   
                    <div>
                        <label className="block text-gray-700 font-semibold">Skills</label>
                        <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                            placeholder="e.g. React, Python, etc."
                        />
                    </div>


                    <div>
                        <label className="block text-gray-700 font-semibold">Pronouns</label>
                        <input
                            type="text"
                            value={pronouns}
                            onChange={(e) => setPronouns(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                            placeholder="e.g. she/her, he/him, they/them"
                        />
                    </div>


                    <div>
                        <label className="block text-gray-700 font-semibold">Resume (PDF only)</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="w-full p-2 border rounded-lg"
                        />
                        {resumeFile && (
                            <p className="text-sm text-gray-500 mt-1">
                                Selected file: {resumeFile.name}
                            </p>
                        )}
                    </div>

          
                    <div className="flex gap-4">
                        <div className="flex items-center w-1/2">
                            <FaGithub className="mr-2 text-gray-700" size={24} />
                            <input
                                type="url"
                                value={github}
                                onChange={(e) => setGithub(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                                placeholder="GitHub Profile"
                            />
                        </div>

                        <div className="flex items-center w-1/2">
                            <FaLinkedin className="mr-2 text-blue-600" size={24} />
                            <input
                                type="url"
                                value={linkedin}
                                onChange={(e) => setLinkedin(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                                placeholder="LinkedIn Profile"
                            />
                        </div>
                    </div>

     
                    <div>
                        <label className="block text-gray-700 font-semibold">Interests</label>
                        <input
                            type="text"
                            value={interests}
                            onChange={(e) => setInterests(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                            placeholder="e.g. Machine Learning, Web Development, etc."
                        />
                    </div>


                    <div>
                        <label className="block text-gray-700 font-semibold">Experience</label>
                        <input
                            type="text"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                            placeholder="e.g. 2 years of web development experience"
                        />
                    </div>

      
                    <div>
                        <label className="block text-gray-700 font-semibold">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                            placeholder="City, State or general area"
                        />
                    </div>


                    <div>
                        <label className="block text-gray-700 font-semibold">Weekly Time Commitment (hours)</label>
                        <input
                            type="number"
                            value={weeklyHours}
                            onChange={(e) => setWeeklyHours(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                            placeholder="e.g. 10 hours"
                        />
                    </div>


                    <div>
                        <label className="block text-gray-700 font-semibold">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>


                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg mt-4"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    )

}

export default Signup;