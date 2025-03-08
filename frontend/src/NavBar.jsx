import React from 'react';
import "./css/Navbar.css";
import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <p >Test</p>
            </div>
            <div className="navbar-links">
                <Link to={"/"}><p className="nav-link">Home</p></Link>
                <Link to={"/Profile"}><p className="nav-link">Profile</p></Link>

            </div>
        </nav>
    );
}

export default NavBar