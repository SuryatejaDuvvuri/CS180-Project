import React, {useState, useEffect} from "react";
import { useParams } from 'react-router-dom';
import "./css/Profile.css"
import profileImage from "./assets/profile.png";
import githubLogo from "./assets/github-mark-white.svg";
import websiteLogo from "./assets/website-logo.svg";
import discordLogo from "./assets/discord-logo.svg";
import NoteCards from "./NoteCards";
function Profile(){
    const [imgSrc, setImgSrc] = useState(profileImage);
    const profileUrl = `https://github.com/`;
    const avatarUrl = `${profileUrl}.png`;

    const cs_projects = [
        { id: 1, title: 'Project A', Name: 'John', description: 'Working on 2D platformer game', looking_for: "college students", skills_required: ["C++", "Unity", "Game Design"], progress: "In Progress" },
        { id: 2, title: 'Project B', Name: 'John', description: 'Developing AI-based chatbots for customer service', looking_for: "software engineers", skills_required: ["Python", "Machine Learning", "Natural Language Processing"], progress: "Completed", developer: ["Bob", "jane", "john"] }];

        const { userId } = useParams();
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
                fetchUserProfile();
            }, []);
        
            const fetchUserProfile = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });
        
                    if (!response.ok) {
                        throw new Error("User not found");
                    }
        
                    const data = await response.json();
                    setUser(data);
                } catch (err) {
                    setError(err.message);
                    console.error("Error fetching user profile:", err);
                } finally {
                    setLoading(false);
                }
            };

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
                
                <div className="contact-container">
                    
                    <h3>Contact Info</h3>
                    <h4>example@gmail.com</h4>
                    <h4>phone number</h4>
                    <div className="Links">
                        <a href={profileUrl} title="Github">
                            <img src={githubLogo} alt={avatarUrl}
                            onError={() => setImgSrc(githubLogo)}/>
                        </a>
                        <a href="https://discord.com" title = "Discord">
                            <img src={discordLogo}/>
                        </a>
                        <a href="https://google.com" title = "Personal Website">
                            <img src={websiteLogo}/>
                        </a>
                    </div>
                </div>

            </div>
            <div className="profile-content">
                <div><h2>Resume</h2></div>
                <div><h2>Skill</h2></div>
                <div><h2>Project History</h2></div>
                {/*send feedback = true to display personal project */}
                <NoteCards isProfilePage = {true}/>
            </div>

        </div>
    </>
    );
}
export default Profile;