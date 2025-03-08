/* SOURCES: https://www.codemzy.com/blog/reactjs-dropdown-component
            https://upmostly.com/tutorials/how-to-react-dropdown-menu
            https://www.codewithfaraz.com/react/106/create-dropdown-menu-using-react-js
*/

import React from 'react';
import './Dropdown.css';
import DropdownItem from './DropdownItem.js';
import onSelect from "./Header.js"

// The Dropdown menu. Consists of a button and several DropdownItems
function Dropdown({ title, arr, onSelect,addChosenElem, removeChosenElem}) {

    const [isOpen, setIsOpen] = React.useState(false);

    // Triggers whenever the dropdown button is pressed
    // Calls the openChecker() function, which comes from ProjectCreation
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    }

    // Returns the isOpen bool
    function GetIsOpen() {
        return isOpen;
    }

    const handleSelect = (major) => {
        onSelect(major);
        setIsOpen(false);
    };

    return (
        <div className="dropdown">
            <button className="Button" onClick={toggleDropdown}>
                {/*Dropdown arrow image*/}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={15} height={15} strokeWidth={4} stroke="currentColor" className={`ml-2 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                {/*Is supposed to flip the image up and down. Currently doesn't work and does nothing*/}
                <i className={`fas fa-caret-${isOpen ? 'up' : 'down'}`}></i>
                {title}
            </button>
            {/*Dropdown items*/}
            <div className="dropdown-content">
                {arr.map((arr) =>
                    <DropdownItem text={arr}
                        getIsOpenMethod={GetIsOpen}
                        addChosenElem={addChosenElem}
                        removeChosenElem={removeChosenElem}
                    />)
                }
            </div>
        </div>
    );
};

export default Dropdown;