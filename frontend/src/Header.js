import React from 'react';
import Dropdown from './Dropdown';
import GetMajors from './GetMajors';

import lightLogo from "./assets/light mode logo.png";
import darkLogo from "./assets/dark mode logo.png";

// The header for the website. Consists of a "View profile" button, a "Create project" button,
//    a "Filter" button to filter by majors, and a search bar.
function Header({method}) {

    const [isLight, setMode] = React.useState(true);

    // Triggers whenever the light/dark mode button is pressed
    // Calls App.toggleLightAndDarkMode() to switch the App's className, then
    // sets this.isLight to toggle the image inside the toggle's button
    function toggleLightAndDarkMode()
    {
        method();
        setMode(!isLight);
    }

    return (
    <div>
        <div className="Header">
            {/*Buttons to left*/}
            <div className='Subcategory'>
                {/*Light/Dark mode button*/}
                <button style={{width: 30, padding: "0px"}} className="Button" onClick={toggleLightAndDarkMode}>
                    <img style={{width: 20, margin: "5px"}} src={isLight ? lightLogo : darkLogo} />
                </button>
                <button className='Button'>View Profile</button>
                <button className='Button'>+ Create Project</button>
            </div>
            {/*Buttons to right*/}
            <div className='Subcategory'>
                <Dropdown title={"Filter..."} arr={GetMajors()} />
                {/*Search bar*/}
                <input type="text" className='Button'/>
            </div>
        </div>
        <div className='HeaderShadow'/>
    </div>
    );
}

export default Header;