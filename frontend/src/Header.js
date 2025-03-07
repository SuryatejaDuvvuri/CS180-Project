import React, { useEffect, useState } from "react";
import Dropdown from './Dropdown.js';
import { useMajors } from "./GetMajors.js"; 
import { useNavigate } from "react-router-dom"; 
import lightLogo from "./assets/light mode logo.png";
import darkLogo from "./assets/dark mode logo.png";
import ProjectCreation from "./ProjectCreation.js";
import { auth, logout } from "./firebase.js";

// The header for the website. Consists of a "View profile" button, a "Create project" button,
//    a "Filter" button to filter by majors, and a search bar.

function Header({ darkMode, toggleDarkMode, onMajorChange }) {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const majors = useMajors();
    const currentUser = auth.currentUser;

    const [selectedMajor, setSelectedMajor] = useState("All");
    
    const handleLogout = async () => {
        await logout();
        localStorage.removeItem("authToken"); 
        navigate("/"); 
    };

    // Triggers whenever the light/dark mode button is pressed
    // Calls App.toggleLightAndDarkMode() to switch the App's className, then
    // sets this.isLight to toggle the image inside the toggle's button

    // const [isLight, setIsLight] = useState(() => {
    //     return localStorage.getItem("theme") === "dark" ? false : true;
    // });

    const handleMajorSelect = (event) => {
        const major = event.target.value;
        setSelectedMajor(major);
        if (onMajorChange) 
        {
            onMajorChange(major);
        }
    };

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);



    return (
        <header className={`w-full px-6 py-5 shadow-md ${darkMode === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
            <div className="w-full max-w-7xl mx-auto flex justify-between items-center flex-wrap">

                <div className="hidden md:flex flex-wrap gap-x-4">
                    <button 
                        className={`px-6 py-2 rounded-md transition ${darkMode === "dark" ? "text-white hover:bg-gray-700" : "hover:bg-gray-200"}`}
                        onClick={() => navigate("/home")}
                    >
                        Home
                    </button>
                    <button 
                        className={`px-6 py-2 rounded-md transition ${darkMode === "dark" ? "text-white hover:bg-gray-700" : "hover:bg-gray-200"}`}
                        onClick={() => navigate(`/${currentUser?.email}/profile/`)}
                    >
                        View Profile
                    </button>
                    <button 
                        className={`px-6 py-2 bg-blue-500 text-white rounded-md ${darkMode === "dark" ? "text-white hover:bg-gray-700" : "hover:bg-blue-600"} transition`}
                        onClick={() => navigate("/create")}
                    >
                        + Create Project
                    </button>
                </div>


                <div className="flex items-center space-x-4">
                    <select 
                        className={`rounded-md px-4 py-2 cursor-pointer transition ${darkMode === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
                        onChange={handleMajorSelect}
                        value={selectedMajor}
                    >
                        <option value="All">All Majors</option>
                        {majors.map((major, index) => (
                            <option key={index} value={major}>{major}</option>
                        ))}
                    </select>

        
                    <button 
                        onClick={toggleDarkMode} 
                        className="p-2 rounded-full transition focus:outline-none hover:bg-gray-700"
                    >
                        {darkMode ? '🌞' : '🌜'}
                    </button>


                        {currentUser && (
                            <button
                                onClick={handleLogout}
                                className={`px-6 py-2 rounded-md transition ${darkMode === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
        </header>
    
    );
}

export default Header;
