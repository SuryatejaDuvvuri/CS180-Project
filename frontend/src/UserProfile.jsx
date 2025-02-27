import React, { useState } from 'react';
import './UserProfile.css';

const UserProfile = () => {
    const [profile] = useState({
        name: 'Abraham Zambrano',
        id: 'azamb015',
        location: 'Riverside, CA',
        resume: '[Insert PDF here]',
        skills: ['React', 'JS'],
        currentProjects: ['CS 180', 'CS 179'],
    });

    return (
        <div className="profile-container">
            <h1>User Profile</h1>
            <div className="profile-content">
                <div className="sidebar">
                    <div className="profile-section">
                        <p><strong>Name:</strong> {profile.name}</p>
                    </div>
                    <div className="profile-section">
                        <p><strong>ID:</strong> {profile.id}</p>
                    </div>
                    <div className="profile-section">
                        <p><strong>Location:</strong> {profile.location}</p>
                    </div>
                </div>
                <div className="main-content">
                    <div className="profile-section">
                        <h2>Resume</h2>
                        <p>{profile.resume}</p>
                    </div>
                    <div className="profile-section">
                        <h2>Skills</h2>
                        <ul>
                            {profile.skills.map((skill, index) => (
                                <li key={index}>{skill}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="profile-section">
                        <h2>Current Projects</h2>
                        <ul>
                            {profile.currentProjects.map((project, index) => (
                                <li key={index}>{project}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
