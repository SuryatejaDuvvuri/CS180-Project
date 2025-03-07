
//import logo from './logo.svg';
// import './App.css';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
// import { createRoot } from 'react-dom/client';
import React, {useState, useEffect} from 'react';
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
import ProtectedRoute from "./ProtectedRoute";
//jsx
import NoteCards from "./NoteCards.js";
import Apply from "./apply.jsx";
import NavBar from './NavBar.jsx';
import Note from './Note.jsx';
import { auth, monitorAuthState } from "./firebase";
import {Navigate} from "react-router-dom"

function App() {
  // const [isLight, setMode] = React.useState(true);
  const [token, setTokenState] = useState(localStorage.getItem('authToken'));
  const [selectedMajor, setSelectedMajor] = useState("All");
  const [user, setUser] = useState(null);
  // Triggers whenever the light/dark mode button is pressed
  // Switches the App's className
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
          setUser(currentUser);
      });

      return () => unsubscribe();
  }, []);

    useEffect(() => {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
      localStorage.setItem("theme", theme);
  }, [theme]);


    const toggleTheme = () => {
      setTheme(theme === "light" ? "dark" : "light");
  };

    const handleMajorChange = (major) => {
      console.log("Selected Major:", major);
      setSelectedMajor(major);
  };

  return (
    <Router>
    <div className={`w-screen flex justify-center items-center min-h-screen  ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
          {/* <Home/> */}
          {/* <NoteCards items={cs_projects} category="Recommended" />
          <NoteCards items={film_projects} category="Film" /> */}
          {/* <Note /> */}
          {/* <div className="bg-gradient-to-r from-gradientLeftLight to-gradientRightLight bg-clip-text text-transparent font-bold text-3xl">
            TEXT TEST
          </div> */}
           <div className="text-center">
           {user &&  <Header darkMode = {theme} toggleDarkMode={toggleTheme} onMajorChange={handleMajorChange}/>}
          
            <Routes>

             <Route path=":email/profile/" element={<UserProfile darkMode = {theme} toggleDarkMode={toggleTheme} />} />
               
              <Route path=":email/:projectId/applicants/" element={
                    <ProtectedRoute>
                        <Applicants darkMode = {theme} toggleDarkMode={toggleTheme} />
                    </ProtectedRoute>
                } />

            <Route path="/create" element={
                  <ProtectedRoute>
                     <ProjectCreation darkMode = {theme} toggleDarkMode={toggleTheme} />
                  </ProtectedRoute>
                   
                } />
                <Route path="/home" element={

                    <ProtectedRoute>
                      <Dashboard darkMode = {theme} toggleDarkMode={toggleTheme} selectedMajor ={selectedMajor}  onMajorChange={handleMajorChange} />
                    </ProtectedRoute>
                } />
                 <Route path="/:projectId/apply/" element={
                   <ProtectedRoute>
                      <ApplicationForm darkMode = {theme} toggleDarkMode={toggleTheme} />
                   </ProtectedRoute>
                  } />
                   <Route path = "/:projectId/feedback/" element= {
                    <ProtectedRoute>
                        <Feedback darkMode = {theme} toggleDarkMode={toggleTheme}/>
                    </ProtectedRoute>
                  } />
            <Route path="/" element={<Home darkMode = {theme} toggleDarkMode={toggleTheme} />} />
            <Route path="/login" element={<Login darkMode = {theme} toggleDarkMode={toggleTheme} />} />
            <Route path="/signup" element={<SignUp darkMode = {theme} toggleDarkMode={toggleTheme}/>} />
           
           
          </Routes> 
           </div>
    </div>
    </Router>
  );
}

export default App;
