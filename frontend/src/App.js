import logo from './logo.svg';
import React from 'react';
import './App.css';
import Header from './Header';


function App() {
  const [isLight, setMode] = React.useState(true);
  
  // Triggers whenever the light/dark mode button is pressed
  // Switches the App's className
  function toggleLightAndDarkMode() {
    setMode(!isLight);
  }

  return (
    <div className={isLight ? "App LightMode" : "App DarkMode"}>
      <Header method={toggleLightAndDarkMode}/>
      {/*Text with gradient*/}
      <div className="grad">
        TEXT TEST
      </div>
    </div>
    /*<div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>*/
  );
}

export default App;
