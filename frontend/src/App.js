
// import logo from './logo.svg';
import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './Header.js';
import Home from './Home.js';
import ApplicationForm from './ApplicationForm.js';
import UserProfile from './UserProfile.js';
import SignUp from './Signup.js';
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import ProjectCreation from './ProjectCreation.js';
import ProjectManagement from './ProjectManagement.js';
import Email from "./Email.js"
import Applicants from "./Applicants.js"

function App() {
  const [isLight, setMode] = React.useState(true);
  
  // Triggers whenever the light/dark mode button is pressed
  // Switches the App's className
  function toggleLightAndDarkMode() {
    setMode(!isLight);
  }

  return (

    <div className="App">
      <div className={isLight ? "App LightMode" : "App DarkMode"}>
        <Router>
          <Header method={toggleLightAndDarkMode} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/create" element={<ProjectCreation />} />
            <Route path="/manage" element={<ProjectManagement />} />
            <Route path="/email" element={<Email />} />
            <Route path="/applicants" element={<Applicants />} />
          </Routes>
        </Router>
          
          <div className="grad">
            TEXT TEST
          </div>
        
      </div>
    </div>
  );
}

export default App;
