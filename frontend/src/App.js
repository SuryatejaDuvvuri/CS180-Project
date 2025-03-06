
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
import Profile from './Profile.jsx';
import Note from './Note.jsx';
import { auth, monitorAuthState } from "./firebase";
import {Navigate} from "react-router-dom"

function App() {
  // const [isLight, setMode] = React.useState(true);
  const [token, setTokenState] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  // Triggers whenever the light/dark mode button is pressed
  // Switches the App's className
  const [isLight, setIsLight] = useState(() => {
      return localStorage.getItem("theme") !== "dark";
  });

  useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
          setUser(currentUser);
      });

      return () => unsubscribe();
  }, []);

    useEffect(() => {
        if (isLight) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        }
    }, [isLight]);


    const toggleLightAndDarkMode = () => {
        setIsLight((prevMode) => !prevMode);
    };

  return (
    <Router>
    <div className={`min-h-screen ${isLight ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
      
      <div className={`flex-1 w-full ${isLight ? "light" : "dark"}`}>
        
            <Header method={toggleLightAndDarkMode} />
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
           <Route path="/profile" element={
             <ProtectedRoute>
               <UserProfile />
             </ProtectedRoute>
           }
              
              />
                 <Route path="/create" element={
                  <ProtectedRoute>
                     <ProjectCreation />
                  </ProtectedRoute>
                   
                } />
                <Route path="/manage" element={
                    <ProtectedRoute>
                    <ProjectManagement />
                 </ProtectedRoute>

                } />
                {/* <Route path="/email" element={

                    <Email />

                } /> */}
                <Route path="/applicants" element={

                    <ProtectedRoute>
                    <Applicants />
                    </ProtectedRoute>

                } />
                <Route path="/home" element={

                    <ProtectedRoute>
                    <Dashboard />
                    </ProtectedRoute>


                } />
                <Route path='/apply' element={
                  <ProtectedRoute>
                    <Apply />
                  </ProtectedRoute>

                } />
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

           
          </Routes>
           </div>
      </div>
    </div>
    </Router>
  );
  /*return(
    <div className={isLight ? "App LightMode" : "App DarkMode"}>
      <Router>
        <Header/>
      </Router>
      <ApplicationForm/>
    </div>
  );*/
}

export default App;
