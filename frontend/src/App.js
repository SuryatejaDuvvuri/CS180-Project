import React, {useState} from 'react';
import './App.css';
import SignUp from './Signup';
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
  const [image, setImage] = useState(null);
  const [color, setColor] = useState(null);
  const colorOptions = ['red','orange','yellow','green','blue','purple'];
 
  return (
    <div className="App">
      <SignUp />
      <br/>

      <h1>New Project</h1>
      <form onSubmit={(e) => {e.preventDefault(); alert("Working")} } className = "form-container">

        <label className="form-label">Project Image: 
          <input type = "file" onChange={(e) => setImage(e.target.files[0])} className="form-input"/>
          {image && (
            <div className="file-info">
              <strong>Selected:</strong> {image.name}
            </div>
          )}
        </label>

        <div className="form-label">
          <span>Color:</span>
          <div className="color-row">
            {colorOptions.map((c) => (
              <div 
                key={c}
                onClick={() => setColor(c)}
                className={`color-circle ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>



        <label name = "name" className="form-label"> 
          Project Name: <input type = "text" value = {name} className="form-input" onChange={(e) => setName(e.target.value)}/>
        </label>
        <br/>
        <label className="form-label">
          <span>Project Description:</span>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            className="form-textarea"
          />
        </label>
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
        <label>Number of people: <input type="number" value = {val} onChange = {(e) => setVal(e.target.value)} className="form-input"/></label>
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
        <label className="form-label">Weekly Time Commitment (hours): 
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
