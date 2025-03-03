import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';

function HelloWorld() {
  return (<h1 className="greeting">Hello, world!</h1>);
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found! Ensure index.html contains <div id='root'></div>");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode> 
    <BrowserRouter>
      <App />
    </BrowserRouter>
    
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();