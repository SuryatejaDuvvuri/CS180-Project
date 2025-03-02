import React from "react";
import "./css/Profile.css"
import profileImage from "./assets/profile.png";
import gitImage from "./assets/logo-github.png";
import NoteCards from "./NoteCards";
function Profile(){

    const cs_projects = [
        { id: 1, title: 'Project A', Name: 'John', description: 'Working on 2D platformer game', looking_for: "college students", skills_required: ["C++", "Unity", "Game Design"], progress: "In Progress" },
        { id: 2, title: 'Project B', Name: 'John', description: 'Developing AI-based chatbots for customer service', looking_for: "software engineers", skills_required: ["Python", "Machine Learning", "Natural Language Processing"], progress: "Completed", developer: ["Bob", "jane", "john"] }];

    return(
    <>
        <div className="container">
            <div className="left-panel">
                <div className="top-info">
                    <img className = "image" src={profileImage} alt="img"/>
                    <h1>John</h1>
                    <p>Full Stack developer</p>
                    <p>Riverside, CA</p>
                </div>
                
                <div className="link-info">
                    
                    <h3>Email here</h3>
                    <h3>Github</h3>
                    <h3>linkedIn</h3>
                    <h3>Website</h3>
                </div>

            </div>
            <div className="profile-content">
                <div><h1>Resume</h1></div>
                <div><h1>Skill</h1></div>
                <div><h1>Project History</h1></div>
                <NoteCards items = {cs_projects}/>
            </div>

        </div>
    </>
    );
}
export default Profile;