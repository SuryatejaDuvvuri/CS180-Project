import React, { useEffect, useState } from "react";
import Dropdown from './Dropdown.js';
import { useMajors } from "./GetMajors"; 
import { useNavigate } from "react-router-dom"; 
import lightLogo from "./assets/light mode logo.png";
import darkLogo from "./assets/dark mode logo.png";
import ProjectCreation from "./ProjectCreation";
import { auth, logout } from "./firebase.js";

// The header for the website. Consists of a "View profile" button, a "Create project" button,
//    a "Filter" button to filter by majors, and a search bar.

function Header({ darkMode, toggleDarkMode, onMajorChange }) {

    const navigate = useNavigate();
    // const [showProjectCreation, setShowProjectCreation] = React.useState(false);
    const majors = useMajors();
    const currentUser = auth.currentUser;
   
    // useEffect(() => {
    //     async function fetchMajors() {
    //         const majorList = useMajors();
    //         setMajors(majorList);
    //     }
    //     fetchMajors();
    // }, []);

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
        <header className={`w-full px-6 py-3 shadow-md ${darkMode ? "bg-gray-900" : "bg-white"}`}>
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <button className = "text-xl font-bold text-gray-900 dark:text-white" onClick={() => navigate("/")}>
                 <span className="text-blue-500">Welcome</span>
                </button>
                <div className="hidden md:flex space-x-6">
                    <button 
                            className={`px-3 py-2 rounded ${darkMode ? "text-white" : "text-gray-700"} hover:bg-gray-200`}
                            onClick={() => navigate("/home")}
                    >
                        Home
                    </button>
                    <button 
                        className={`px-3 py-2 rounded ${darkMode ? "text-white" : "text-gray-700"} hover:bg-gray-200`}
                        onClick={() => navigate(":email/profile/")}>
                        View Profile
                    </button>
                    <button 
                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => navigate("/create")}
                    >
                        + Create Project
                    </button>
                </div>

                <div className="w-full flex justify-center">
                    <select 
                        className="text-white bg-green-500 rounded-md px-4 py-2 cursor-pointer"
                        onChange={handleMajorSelect}
                        value={selectedMajor}
                    >
                        <option value="All">All Majors</option>
                        {majors.map((major, index) => (
                            <option key={index} value={major}>{major}</option>
                        ))}
                    </select>
                </div>


                <div className="flex items-center space-x-4">
                    <button onClick={toggleDarkMode} className="p-2 rounded-full focus:outline-none">
                        {darkMode ? '🌞' : '🌜'}
                    </button>
                    {currentUser && (
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>
            <div className="text-white bg-headerShadow p-1 w-full flex items-center justify-center" />
        </header>
    
    );
}

export default Header;
