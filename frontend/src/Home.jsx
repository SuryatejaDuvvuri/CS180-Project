import React from 'react';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            <header className="home-header">
                <button className="btn">Sign Up</button>
                <button className="btn">Login</button>
            </header>
            <div className="home-content">
                <h1>Welcome!</h1>
                <h2>Features</h2>
                <ul>
                    <li>Bulletpoint 1</li>
                    <li>Bulletpoint 2</li>
                    <li>Bulletpoint 3</li>
                    <li>Bulletpoint 4</li>
                </ul>
            </div>
        </div>
    );
};

export default Home;
