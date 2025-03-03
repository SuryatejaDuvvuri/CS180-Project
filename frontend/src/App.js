// import logo from './logo.svg';
// import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { createRoot } from 'react-dom/client';
import React from 'react';
import Header from './Header.js';
import Home from './Home.js';
import Login from './components/Login.js';
import ApplicationForm from './ApplicationForm.js';
import UserProfile from './UserProfile.js';
import SignUp from './Signup.js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ProjectCreation from './ProjectCreation.js';
import ProjectManagement from './ProjectManagement.js';
import Email from "./Email.js"
import Applicants from "./Applicants.js"
import Feedback from "./Feedback.js"
// import Login from "./components/Login";
// import Signup from "./components/Signup"; 
import Dashboard from "./pages/Dashboard";

//jsx
import NoteCards from "./NoteCards.js";
import Apply from "./apply.jsx";
import NavBar from './NavBar.jsx';
import Profile from './Profile.jsx';
import Note from './Note.jsx';

function App() {
  const [isLight, setMode] = React.useState(true);
  
  // Triggers whenever the light/dark mode button is pressed
  // Switches the App's className
  function toggleLightAndDarkMode() {
    setMode(!isLight);
  }

  return (
    <div className="w-screen flex flex-col w-full  bg-gray-50 justify-between">
      
      <div className={`flex-1 w-full ${isLight ? "App LightMode" : "App DarkMode"}`}>
        
            {/* <Header method={toggleLightAndDarkMode} /> */}
          {/* <Home/> */}
          {/* <NoteCards items={cs_projects} category="Recommended" />
          <NoteCards items={film_projects} category="Film" /> */}
          {/* <Note /> */}
          {/* <div className="bg-gradient-to-r from-gradientLeftLight to-gradientRightLight bg-clip-text text-transparent font-bold text-3xl">
            TEXT TEST
          </div> */}
           <div className="text-center bg-websiteBackground">
           {/* <Header method={toggleLightAndDarkMode} /> */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/create" element={<ProjectCreation />} />
                <Route path="/manage" element={<ProjectManagement />} />
                <Route path="/email" element={<Email />} />
                <Route path="/applicants" element={<Applicants />} />
                <Route path="/home" element={<Dashboard />} />
                <Route path='/Profile' element={<Profile/>}/>
                <Route path='/Apply' element={<Apply/>}/>
              </Routes>
            </div>
      </div>
    </div>

  );
}

export default App;
