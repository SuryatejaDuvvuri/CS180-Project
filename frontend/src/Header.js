import React, { useEffect, useState } from "react";
import Dropdown from './Dropdown.js';
import { useMajors } from "./GetMajors"; 
import { useNavigate } from "react-router-dom"; 
import lightLogo from "./assets/light mode logo.png";
import darkLogo from "./assets/dark mode logo.png";
import ProjectCreation from "./ProjectCreation";
import { logout } from "./firebase.js";

// The header for the website. Consists of a "View profile" button, a "Create project" button,
//    a "Filter" button to filter by majors, and a search bar.

function Header({method, onMajorChange}) {

    const navigate = useNavigate();
    // const [showProjectCreation, setShowProjectCreation] = React.useState(false);
    const majors = useMajors();
    const [isLight, setMode] = useState(true);
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
        if (isLight) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        }
    }, [isLight]);

    const toggleLightAndDarkMode = () => {
        method();
        setMode(!isLight);
    };



    return (
        <header className={`w-screen bg-${isLight ? 'white' : 'gray-900'} text-${isLight ? 'black' : 'white'}`}>
            <div className="bg-mainColor p-5 flex items-center justify-between">
                <div className="flex space-x-4 items-center">
                        <button 
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => navigate("/home")}
                        >
                            Back to Home
                        </button>
                    <button 
                        className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => navigate(":email/profile/")}>
                        View Profile
                    </button>
                    <button 
                        className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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
                    <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={toggleLightAndDarkMode}>
                        {isLight ? '🌞' : '🌜'}
                    </button>
                    <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
            <div className="text-white bg-headerShadow p-1 w-full flex items-center justify-center" />
        </header>
    
    );
}

export default Header;