

import React from 'react';
import {Routes, Route } from 'react-router-dom';

//css
import './css/App.css';

//jsx
import NoteCards from "./NoteCards";
import Apply from "./apply.jsx";
import NavBar from './NavBar.jsx';




const cs_projects = [
  { id: 1, title: 'Project A', Name: 'John', description: 'Working on 2D platformer game', looking_for: "college students", skills_required: ["C++", "Unity", "Game Design"], progress: "In Progress" },
  { id: 2, title: 'Project B', Name: 'Alice', description: 'Developing AI-based chatbots for customer service', looking_for: "software engineers", skills_required: ["Python", "Machine Learning", "Natural Language Processing"], progress: "Completed" },
  { id: 3, title: 'Project C', Name: 'Bob', description: 'Building a mobile app for task management', looking_for: "app developers", skills_required: ["React Native", "Firebase", "UI/UX Design"], progress: "In Progress" },
  { id: 4, title: 'Project D', Name: 'Eve', description: 'Creating a web app for time tracking and productivity', looking_for: "frontend developers", skills_required: ["JavaScript", "CSS", "React"], progress: "Not Started" },
  { id: 5, title: 'Project E', Name: 'Sarah', description: 'Developing a machine learning algorithm for image recognition', looking_for: "data scientists", skills_required: ["Python", "TensorFlow", "Computer Vision"], progress: "In Progress" },
  { id: 6, title: 'Project F', Name: 'Mike', description: 'Working on a cloud-based storage solution', looking_for: "cloud engineers", skills_required: ["AWS", "Node.js", "Security"], progress: "Completed" },
  { id: 7, title: 'Project G', Name: 'Tom', description: 'Building a social media platform for gamers', looking_for: "backend developers", skills_required: ["Node.js", "MongoDB", "WebSockets"], progress: "In Progress" },
  { id: 8, title: 'Project H', Name: 'Rachel', description: 'Creating a data visualization dashboard for business analytics', looking_for: "data analysts", skills_required: ["Python", "Tableau", "SQL"], progress: "Not Started" },
  { id: 9, title: 'Project I', Name: 'Chris', description: 'Developing a personal finance app', looking_for: "mobile developers", skills_required: ["Swift", "Xcode", "Financial APIs"], progress: "Completed" },
  { id: 10, title: 'Project J', Name: 'Diana', description: 'Building an e-commerce platform with advanced search features', looking_for: "full-stack developers", skills_required: ["React", "Node.js", "GraphQL"], progress: "In Progress" }
];

const film_projects = [
  { id: 1, title: 'Short Film A', Name: 'Liam', description: 'Creating a sci-fi short film with practical effects', looking_for: "cinematographers", skills_required: ["Camera Operation", "Lighting", "Editing"], progress: "In Progress" },
  { id: 2, title: 'Documentary B', Name: 'Sophia', description: 'Producing a documentary about climate change', looking_for: "researchers", skills_required: ["Interviewing", "Research", "Video Editing"], progress: "Completed" },
  { id: 3, title: 'Animation C', Name: 'Noah', description: 'Developing a 2D animated short film', looking_for: "animators", skills_required: ["Adobe Animate", "Storyboarding", "Character Design"], progress: "In Progress" },
  { id: 4, title: 'Feature Film D', Name: 'Olivia', description: 'Directing an indie drama film', looking_for: "actors", skills_required: ["Acting", "Screenwriting", "Directing"], progress: "Not Started" },
  { id: 5, title: 'Experimental Film E', Name: 'James', description: 'Exploring avant-garde storytelling techniques', looking_for: "visual artists", skills_required: ["Abstract Filmmaking", "Color Grading", "Sound Design"], progress: "In Progress" },
  { id: 6, title: 'Horror Film F', Name: 'Emma', description: 'Shooting a psychological horror short', looking_for: "makeup artists", skills_required: ["SFX Makeup", "Set Design", "Cinematography"], progress: "Completed" },
  { id: 7, title: 'Music Video G', Name: 'Benjamin', description: 'Directing a music video for an indie band', looking_for: "editors", skills_required: ["Adobe Premiere", "After Effects", "Choreography"], progress: "In Progress" },
  { id: 8, title: 'Comedy Sketch H', Name: 'Ava', description: 'Filming a series of short comedy sketches', looking_for: "writers", skills_required: ["Comedy Writing", "Improv", "Editing"], progress: "Not Started" },
  { id: 9, title: 'Fantasy Film I', Name: 'Ethan', description: 'Creating a fantasy adventure short with CGI', looking_for: "VFX artists", skills_required: ["Blender", "Maya", "Compositing"], progress: "Completed" },
  { id: 10, title: 'Thriller Film J', Name: 'Mia', description: 'Producing a suspenseful thriller with a twist ending', looking_for: "producers", skills_required: ["Budgeting", "Casting", "Production Management"], progress: "In Progress" }
];




function App() {
  return (
    <>
    <NavBar/>
      <main>
      <Routes>
        <Route path='/' element= {
            <>
              
              <NoteCards items = {cs_projects} category ="Recommended"/>
              <NoteCards items = {film_projects} category ="Film"/>
              <NoteCards items = {cs_projects} category ="cs"/>
            </>
          }/>
        <Route path='/Apply' element= {<Apply/>}/>
      </Routes>
    </main>
    </>
  );
}

export default App;
