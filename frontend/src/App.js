import React, {useState} from 'react';
import './App.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function App() {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [range, setRange] = useState([null, null]);
  const [startDate, endDate] = range;
  const [val, setVal] = useState(0);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(0);

 
  return (
    <div className="App">
      <form onSubmit={(e) => {e.preventDefault(); alert("Working")} }>
        <label name = "name"> Project Name: <input type = "text" value = {name} onChange={(e) => setName(e.target.value)}/></label>
        <br/>
        <label>Project Description: <input type = "text" value = {desc} onChange = {(e) => setDesc(e.target.value)}/></label>
        <label>Project Duration:  
        <DatePicker
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => {
            setRange(update);
          }}
          isClearable={true}
        />
        </label>
        <label>Number of people: <input type="number" value = {val} onChange = {(e) => setVal(e.target.value)} /></label>
        <label>Categories: 
          <datalist>
            <option value = "Computer Science"/>
            <option value = "Medicine"/>
            <option value = "Filmmaking"/>
            <option value = "Art"/>
            <option value = "Psychology"/>
            <option value = "History"/>
          </datalist> </label>
        <label>Location: <input type = "text" value = {location} onChange = {(e) => setLocation(e.target.value)}/> </label>
        <label>Weekly Time Commitment (hours): 
          <input 
            type="number" 
            min="1" 
            max="168" 
            value={weeklyHours} 
            onChange={(e) => setWeeklyHours(e.target.value)}
          />
        </label>
        <br/>        
        <input type = "submit" value = "Submit"/>
      </form>
    </div>
 
  );
}

export default App;
