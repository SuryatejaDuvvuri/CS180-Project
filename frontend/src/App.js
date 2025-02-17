import React, {useState} from 'react';
import './App.css';
import SignUp from './Signup';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ProjectCreation from './ProjectCreation';
import ProjectManagement from './ProjectManagement';

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
      {/* <SignUp />
      <ProjectCreation/> */}
      <ProjectManagement/>
    </div>
 
  );
}

export default App;
