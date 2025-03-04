import React, { useState } from "react";
import Dropdown from './Dropdown.js';
import GetMajors from './GetMajors.js';
import { useNavigate } from "react-router-dom"; 
import lightLogo from "./assets/light mode logo.png";
import darkLogo from "./assets/dark mode logo.png";
import ProjectCreation from "./ProjectCreation";

// The header for the website. Consists of a "View profile" button, a "Create project" button,
//    a "Filter" button to filter by majors, and a search bar.
function Header() {

    const navigate = useNavigate();
    // const [showProjectCreation, setShowProjectCreation] = React.useState(false);
    const [majors, setMajors] = useState([]);

    return (
        <div>
            <div className="Header">
                {/*Buttons to left*/}
                <div className='Subcategory'>
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
            </div>
            <div className='HeaderShadow' />
        </div>
    );
}

export default Header;