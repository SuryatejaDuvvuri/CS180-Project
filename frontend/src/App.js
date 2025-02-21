
import logo from './logo.svg';
import './App.css';
import React from 'react';
import Header from './Header';
import Home from './Home';
import ApplicationForm from './ApplicationForm';
import UserProfile from './UserProfile';

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
          <Header method={toggleLightAndDarkMode}/>
          {/*Text with gradient*/}
          <div className="grad">
            TEXT TEST
          </div>
        
        </div>
         <ApplicationForm />
      </div>
    </div>
  );
}

export default App;
