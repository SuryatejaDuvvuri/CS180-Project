import React, { useState, useEffect } from "react";
import './ProjectCreation.css';
import DatePicker from "react-datepicker";
import { useMajors } from "./GetMajors.js"; 
import "react-datepicker/dist/react-datepicker.css";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown.js";
import GetMajors from './GetMajors.js';

function ProjectCreation({darkMode, toggleDarkMode}) {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
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

    const colorOptions = ['#FF5D5D', '#FFC785', '#A0D683', '#578FCA', '#A294F9', '#FDB7EA'];

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
        color: '#FF5D5D', 
        image: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjectData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    
        if (name === "category") {
            setCategory(value); 
        }
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
                setImage(image);
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

            const response = await fetch(`${API_BASE_URL}/api/projects/`, {
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
            navigate("/home");
        } catch (err) {
            setError(err.message);
            console.error("Error creating project:", err);
        }
    };

    return (
        <div className={`flex justify-center items-center min-h-screen ${darkMode === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
            <div 
                className={`p-8 rounded-lg shadow-lg w-full max-w-3xl md:max-w-2xl transition-all duration-300`} 
                style={{ backgroundColor: projectData.color || (darkMode === "dark" ? "#1F2937" : "#ffffff") }}
            > 
                <h1 className="text-2xl font-bold text-center mb-6">Create a New Project</h1>
        
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">Project Name:</label>
                        <input 
                            type="text" name="name" value={projectData.name} onChange={handleChange} 
                            className={`w-full px-4 py-2 rounded-md border border-gray-300 focus:ring focus:ring-blue-400 focus:outline-none ${
                                darkMode === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"
                            }`} required 
                        />
                    </div>
        
                    <div>
                        <label className="block font-medium mb-1">Project Description:</label>
                        <textarea 
                            name="description" value={projectData.description} onChange={handleChange} rows={4} 
                            className={`w-full px-4 py-2 rounded-md border border-gray-300 focus:ring focus:ring-blue-400 focus:outline-none ${
                                darkMode === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"
                            }`} required 
                        />
                    </div>
        
                    <div>
                        <label className="block font-medium mb-1">Project Duration:</label>
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => setRange(update)}
                            isClearable={true}
                            className={`w-full px-4 py-2 rounded-md border border-gray-300 focus:ring focus:ring-blue-400 focus:outline-none ${
                                darkMode === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"
                            }`}
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Number of people:</label>
                        <textarea 
                            name="people" value={val} onChange={(e) => setVal(e)} rows={4} 
                            className={`w-full px-4 py-2 rounded-md border border-gray-300 focus:ring focus:ring-blue-400 focus:outline-none ${
                                darkMode === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"
                            }`} required 
                        />
                    </div>
        
                    <div>
                        <label className="block font-medium mb-1">Looking For:</label>
                        <input 
                            type="text" name="looking_for" value={looking_for} onChange={(e) => setLookingFor(e.target.value)} 
                            className={`w-full px-4 py-2 rounded-md border border-gray-300 focus:ring focus:ring-blue-400 focus:outline-none ${
                                darkMode === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"
                            }`} 
                        />
                    </div>
        
                    <div>
                        <label className="block font-medium mb-1">Category:</label>
                        <select 
                            name="category" value={projectData.category} onChange={handleChange} 
                            className={`w-full px-4 py-2 rounded-md border border-gray-300 focus:ring focus:ring-blue-400 focus:outline-none ${
                                darkMode === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"
                            }`} required
                        >
                            <option value="">Select a category</option>
                            {majors.map((major, index) => (
                                <option key={index} value={major}>{major}</option>
                            ))}
                        </select>
                    </div>
        
                    <div>
                        <label className="block font-medium mb-1">Upload Image:</label>
                        <div className="relative w-full">
                            <input 
                                type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} 
                                className="hidden"
                                id="fileInput"
                            />
                            <label 
                                htmlFor="fileInput" 
                                className="cursor-pointer flex justify-center items-center w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-200 text-black hover:bg-gray-300"
                            >
                                Choose File
                            </label>

                            {image && (
                                <p className="text-green-500 text-sm mt-1">
                                    Selected File: {image.name}
                                </p>
                            )}
                        </div>
                    </div>
        

                    <div>
                        <label className="block font-medium mb-1">Project Card Color:</label>
                        <div className="flex gap-2 mt-2">
                            {colorOptions.map((c) => (
                                <div 
                                    key={c}
                                    onClick={() => setProjectData({ ...projectData, color: c })}
                                    className={`cursor-pointer w-8 h-8 rounded-full transition ${
                                        projectData.color === c ? 'ring-2 ring-offset-2 ring-black' : ''
                                    }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
        
                    <button 
                        type="submit" 
                        className={`w-full px-4 py-2 rounded-md text-white font-semibold transition ${
                            darkMode === "dark" ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-500 hover:bg-blue-600"
                        }`}
                    >
                        Create Project
                    </button>
        
                </form>
        
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
    </div>
    );
}
export default ProjectCreation;