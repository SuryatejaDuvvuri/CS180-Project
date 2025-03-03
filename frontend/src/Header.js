import React, { useState } from "react";
import Dropdown from './Dropdown.js';
import GetMajors from './GetMajors.js';
import { useNavigate } from "react-router-dom"; 
import lightLogo from "./assets/light mode logo.png";
import darkLogo from "./assets/dark mode logo.png";
import ProjectCreation from "./ProjectCreation";

// The header for the website. Consists of a "View profile" button, a "Create project" button,
//    a "Filter" button to filter by majors, and a search bar.
function Header({method}) {

    const navigate = useNavigate();
    const [isLight, setMode] = React.useState(true);
    // const [showProjectCreation, setShowProjectCreation] = React.useState(false);
    const [majors, setMajors] = useState([]);

    // Triggers whenever the light/dark mode button is pressed
    // Calls App.toggleLightAndDarkMode() to switch the App's className, then
    // sets this.isLight to toggle the image inside the toggle's button
    function toggleLightAndDarkMode()
    {
        method();
        setMode(!isLight);
    }

    return (
        <header className={`w-screen h-screen ${!isLight ? 'bg-websiteBackgroundDark' : 'bg-websiteBackground'} text-gray-900 dark:text-white`}>
        <div className="bg-mainColor p-5 flex items-center justify-between">
            <div className="flex justify-between h-16">
                <div className="flex space-x-4 items-center">
                    <button 
                        className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => navigate("/profile")}
                    >
                        View Profile
                    </button>
                    <button 
                        className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate("/create")}
                    >
                        + Create Project
                    </button>
                </div>
            </div>
            <div className="w-full flex justify-center mt-4">
                <Dropdown className = "text-white bg-green-500 rounded-md px-2 py-1 w-max" title={"Filter..."} arr={majors} />
                <input type="text" className="border p-2 rounded-md w-64" placeholder="Search projects..." />
            </div>
        </div>

        <div className = "text-white bg-headerShadow p-1 w-full flex items-center justify-center"/>
    </header>
    
    );
}

export default Header;