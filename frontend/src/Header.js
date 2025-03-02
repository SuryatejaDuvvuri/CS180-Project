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
        <div className="Header">
           <div className="Subcategory">
                <button className="Button">View Profile</button>
                <button className="Button" onClick={() => navigate("/create")}>
                    + Create Project
                </button>
            </div>
            <div className="Subcategory">
                <Dropdown title={"Filter..."} arr={majors} />
                <input type="text" className="Button" />
            </div>
            {/*Buttons to left*/}
            <div className='Subcategory'>
                {/*Light/Dark mode button*/}
                <button style={{width: 30, padding: "0px"}} className="Button" onClick={toggleLightAndDarkMode}>
                    <img style={{width: 20, margin: "5px"}} src={isLight ? lightLogo : darkLogo} />
                </button>
                <button className='Button'>View Profile</button>
                <button className="Button" onClick={() => navigate("/create")}>
                    + Create Project
                </button>
            </div>
            {/*Buttons to right*/}
            <div className='Subcategory'>
                <Dropdown title={"Filter..."} arr={GetMajors()} />
                {/*Search bar*/}
                <input type="text" className='Button'/>
            </div>
            <div className='HeaderShadow' />
        </div>
    );
}

export default Header;