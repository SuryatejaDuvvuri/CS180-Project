import React, {useState} from 'react';
import './App.css';
import SignUp from './Signup';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function App() {
  const [name, setName] = useState('');
  const [emailSending, setEmailSending] = useState(false);
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
  const sendEmail = async () => {
    setEmailSending(true);
    try {
      const response = await fetch('http://localhost:8000/send-email/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: 'sduvv003@ucr.edu',
          name: 'John Doe',
          subject: 'New Project Submission',
          message: 'Test email from React frontend'
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Success:', data);
    }
    catch (error) {
      console.error('Error:', error);
    }
    finally {
      setEmailSending(false);
    }
  };

  const handleSend = async () => {
    setEmailSending(true);
    await sendEmail();
    setEmailSending(false);
  };
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
          <datalist id="categories">
            <option value="Computer Science"/>
            <option value="Medicine"/>
          </datalist>
        </label>
      </form>

      <button onClick={handleSend} disabled={emailSending} className="form-button">{emailSending ? 'Sending...': 'Submit'}</button>
          
    
    </div>
  );
}

export default App;
