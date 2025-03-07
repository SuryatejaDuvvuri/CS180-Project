import React, { useState, useEffect } from "react";
import './ProjectCreation.css';
import DatePicker from "react-datepicker";
import { useMajors } from "./GetMajors";
import "react-datepicker/dist/react-datepicker.css";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown.js";
import GetMajors from './GetMajors.js';

function ProjectCreation() {
    const [range, setRange] = useState([null, null]);
    const [startDate, endDate] = range;
    const [error, setError] = useState(null);
    const [val, setVal] = useState(0);
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [weeklyHours, setWeeklyHours] = useState(0);
    const [image, setImage] = useState(null);
    const [skills, setSkills] = useState([]);
    const [looking_for, setLookingFor] = useState('');
    const navigate = useNavigate();
    const majors = useMajors();
    const colorOptions = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

    const [projectData, setProjectData] = useState({
        name: '',
        description: '',
        owner: '',
        start_date: null,
        end_date: null,
        no_of_people: 0,
        looking_for: '',
        category: '',
        location: '',
        weekly_hours: 0,
        color: '',
        image: null
    });

    const handleChange = (e) => {
        setProjectData({ ...projectData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            setError("You need to be logged in to create a project.");
            return;
        }

        if (!projectData.name || !projectData.description || !projectData.category) {
            setError("Please fill all required fields.");
            return;
        }

        try {
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

            const finalProjectData = {
                ...projectData,
                owner: user.email,
                start_date: startDate ? startDate.toISOString() : null,
                end_date: endDate ? endDate.toISOString() : null,
                no_of_people: val,
                looking_for,
                category,
                location,
                weekly_hours: weeklyHours,
                image: imageBase64
            };

            const response = await fetch("http://localhost:8000/api/projects/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify(finalProjectData),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to create project.");
            }

            alert("Project created successfully!");
            navigate("/applicants");
        } catch (err) {
            setError(err.message);
            console.error("Error creating project:", err);
        }
    };

    return (
        <div className="ProjectCreation">
            <br />
            <h1>Create a New Project</h1>
            <form onSubmit={handleSubmit} className="form-container">
                {/* Project Name */}
                <label className="form-label">Project Name:
                    <input type="text" name="name" value={projectData.name} onChange={handleChange} className="form-input" required />
                </label>

                {/* Project Description */}
                <label className="form-label">Project Description:
                    <textarea name="description" value={projectData.description} onChange={handleChange} rows={4} className="form-textarea" required />
                </label>

                {/* Project Duration */}
                <label className="form-label">Project Duration:
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => setRange(update)}
                        isClearable={true}
                        className="date-picker"
                    />
                </label>

                {/* Looking For */}
                <label className="form-label">Looking For:
                    <input type="text" name="looking_for" value={looking_for} onChange={(e) => setLookingFor(e.target.value)} className="form-input" />
                </label>

                {/* Required Skills */}
                <label className="form-label">Required Skills:
                    <input type="text" name="skills" value={skills.join(', ')} onChange={(e) => setSkills(e.target.value.split(','))} className="form-input" />
                </label>

                {/* Number of People */}
                <label className="form-label">Number of People:
                    <input type="number" min="1" value={val} onChange={(e) => setVal(e.target.value)} className="form-input" required />
                </label>

                {/* Category Dropdown */}
                <label className="form-label">Category:
                    <select name="category" value={category} onChange={handleChange} className="form-input" required>
                        <option value="">Select a category</option>
                        {majors.map((major, index) => (
                            <option key={index} value={major}>{major}</option>
                        ))}
                    </select>
                </label>

                {/* Location */}
                <label className="form-label">Location:
                    <input type="text" name="location" value={projectData.location} onChange={handleChange} className="form-input" />
                </label>

                {/* Weekly Time Commitment */}
                <label className="form-label">Weekly Time Commitment (hours):
                    <input type="number" min="1" max="168" name="weekly_hours" value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} className="form-input" required />
                </label>

                {/* Image Upload */}
                <label className="form-label">Upload Image:
                    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="form-input" />
                </label>

                {/* Color Selection */}
                <label className="form-label">Project Color:
                    <div className="color-row">
                        {colorOptions.map((c) => (
                            <div key={c} onClick={() => setProjectData({ ...projectData, color: c })} className={`color-circle ${projectData.color === c ? 'selected' : ''}`} style={{ backgroundColor: c }} />
                        ))}
                    </div>
                </label>

                {/* Submit Button */}
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Create Project</button>
            </form>

            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
}

export default ProjectCreation;