import React, { useState } from "react";
import './ProjectCreation.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function ProjectCreation() {
    const [range, setRange] = useState([null, null]);
    const [startDate, endDate] = range;
    const [image, setImage] = useState(null);
    const [color, setColor] = useState(null);
    const colorOptions = ['rgb(204, 83, 83)','rgb(245, 173, 66)','rgb(237, 215, 107)','rgb(122, 224, 124)','var(--box-background)','rgb(181, 122, 224)','rgb(230, 167, 192)','rgb(197, 197, 197)'];
    
    const [createData, setCreateData] = useState({
        projImg: '',
        name: '',
        desc: '',
        numPpl: '',
        location: '',
        weeklyTime: '',
    });
    
    // I didn't end up using the setCreateError function because I wasn't sure how to use it
    const [createError, setCreateError] = useState({
        projImgError: false,
        projImgChanged: false,
        colorError: false,
        colorChanged: false,
        projNameError: false,
        projDescError: false,
        projDurError: false,
        numPplError: false,
        categoriesError: false,
        locationError: false,
        weeklyTimeError: false,
    });

    //Not applicable to project image, color, duration, and categories
    const handleChange = (e) => {
      setCreateData({ ...createData, [e.target.name]: e.target.value });
    };

    /* Before submitting, update the form data one last time to ensure there are no lagged inputs.
       First, check to make sure there are no input errors. We check each input individually.
       If there are no errors, submit the form. Otherwise, update the display to show the errors.
    */
    const handleSubmit = (e) => {
      setCreateData({ ...createData, [e.target.name]: e.target.value });
      checkProjImg(e);
      checkColor(e);
      checkProjName(e);
      checkProjDesc(e);
      checkProjDur(e);
      checkNumPpl(e);
      checkLocation(e);
      checkWeeklyTime(e);
      // There is no need to check for numPpl and weeklyTime since you cannot submit the form without those being > 0

      e.preventDefault();
      // If there are no errors, send the alert
      if(!(createError.projImgError || createError.colorError || createError.projNameError || createError.projDescError || createError.projDurError || createError.locationError))
          alert('Project created');
    };

    // Sets projImgError to !projImgChanged.
    // projImgChanged only turns to true once the user adds a file to the input.
    // If projImgChanged is true, then there should be no error, meaning projImgError = false.
    // If projImgChanged is false, then there is an error, meaning projImgError = true.
    const checkProjImg = (e) => {
      createError.projImgError = !createError.projImgChanged;
    };

    // Sets colorError to !colorChanged.
    // colorChanged only turns to true once the user adds a file to the input.
    // If colorChanged is true, then there should be no error, meaning colorError = false.
    // If colorChanged is false, then there is an error, meaning colorError = true.
    const checkColor = (e) => {
      createError.colorError = !createError.colorChanged;
    };

    //If name input is filled, there is no error (projNameError = false)
    const checkProjName = (e) => {
      setCreateData({ ...createData, [e.target.name]: e.target.value });
      createError.projNameError = createData.name == '' ? true : false;
    };

    //If desc input is filled, there is no error (projDescError = false)
    const checkProjDesc = (e) => {
      setCreateData({ ...createData, [e.target.name]: e.target.value });
      createError.projDescError = createData.desc == '' ? true : false;
    };

    //If startDate and endDate inputs are filled, there is no error (projDurError = false)
    const checkProjDur = (e) => {
      setCreateData({ ...createData, [e.target.name]: e.target.value });
      createError.projDurError = (startDate == null || endDate == null) ? true : false;
    };

    //If startDate and endDate inputs are filled, there is no error (numPplError = false)
    const checkNumPpl = (e) => {
      setCreateData({ ...createData, [e.target.name]: e.target.value });
      createError.numPplError = createData.numPpl == '' ? true : false;
    };

    //If location input is filled, there is no error (locationError = false)
    const checkLocation = (e) => {
      setCreateData({ ...createData, [e.target.name]: e.target.value });
      createError.locationError = createData.location == '' ? true : false;
    };

    //If startDate and endDate inputs are filled, there is no error (weeklyTimeError = false)
    const checkWeeklyTime = (e) => {
      setCreateData({ ...createData, [e.target.name]: e.target.value });
      createError.weeklyTimeError = createData.weeklyTime == '' ? true : false;
    };
    
    // HACK: I made a label style for each of the inputs because I couldn't hardcode it straight into the html
    /* Unlike ApplicationForm.js and Feedback.jsx, we are imbedding the border styles directly by changing the
       classNames. I cannot get the "styles" component to change otherwise.
    */
    const projImgDisplayStyle = {
      display: createError.projImgError ? "flex" : "none",
    }
    const colorDisplayStyle = {
      display: createError.colorError ? "flex" : "none",
    }
    const nameDisplayStyle = {
      display: createError.projNameError ? "flex" : "none",
    }
    const descDisplayStyle = {
      display: createError.projDescError ? "flex" : "none",
    }
    const durDisplayStyle = {
      display: createError.projDurError ? "flex" : "none",
    }
    const numPplDisplayStyle = {
      display: createError.numPplError ? "flex" : "none",
    }
    const locationDisplayStyle = {
      display: createError.locationError ? "flex" : "none",
    }
    const weeklyTimeDisplayStyle = {
      display: createError.weeklyTimeError ? "flex" : "none",
    }

    // Changes background color to chosen color option
    const backgroundColor = {
      'background-color': color,
    }
     
    return (
        <div className="ProjectCreation">
          <br/>
          <form onSubmit={handleSubmit} className = "form-container"
            style={backgroundColor}>
            {/*Header*/}
            <h1 className="form-title">Create a New Project</h1>

            {/*Image input*/}
            <label className="form-label">Project Image: 
              <input
                className={createError.projImgError ? "form-input error-input" : "form-input"} 
                type = "file"
                onChange={(e) => {
                  setImage(e.target.files[0]);
                  createError.projImgChanged = true;
                }}
              />
              {image && (
                <div className="file-info">
                  <strong>Selected:</strong> {image.name}
                </div>
              )}
              <div style={projImgDisplayStyle}className='errorLabel' >File required</div>
            </label>
            
            {/*Color input*/}
            <label className="form-label">Color:
              <div className={createError.colorError ? "color-row error-input" : "color-row"}>
                {colorOptions.map((c) => (
                  <div 
                    key={c}
                    onClick={() => {
                      setColor(c);
                      createError.colorChanged = true;
                      console.log(createData.color);
                    }}
                    className={`color-circle ${color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div style={colorDisplayStyle}className='errorLabel' >Color required</div>
            </label>
    
            {/*Name input*/}
            <label className="form-label"> 
              Project Name:
              <input
                className={createError.projNameError ? "form-input error-input" : "form-input"} 
                name="name"
                value = {createData.name}
                onChange={handleChange}/>
              <div style={nameDisplayStyle} className='errorLabel' >Required</div>
            </label>
            
            {/*Description input*/}
            <label className="form-label">
              <span>Project Description:</span>
              <textarea
                name="desc"
                value={createData.desc}
                onChange={handleChange}
                rows={4}
                className={createError.projDescError ? "form-textarea error-input" : "form-textarea"}
              />
              <div style={descDisplayStyle} className='errorLabel' >Required</div>
            </label>
            
            {/*Date duration input*/}
            <label className="form-label">Project Duration:
              <DatePicker
                className={createError.projDurError ? "date-picker error-input" : "date-picker"}
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setRange(update);
                }}
                isClearable={true}
              />
              <div style={durDisplayStyle} className='errorLabel' >Start and End date required</div>
            </label>

            {/*Number of people input*/}
            <label className="form-label">Number of people:
              <input
                type = "number"
                name = "numPpl"
                min = "1" 
                value = {createData.numPpl}
                onChange = {handleChange}
                className={createError.numPplError ? "form-input error-input" : "form-input"}
              />
              <div style={numPplDisplayStyle} className='errorLabel' >Required</div>
            </label>

            {/*Categories input*/}
            {/*Currently does nothing*/}
            <label className="form-label">Categories: 
              <datalist>
                <option value = "Computer Science"/>
                <option value = "Medicine"/>
                <option value = "Filmmaking"/>
                <option value = "Art"/>
                <option value = "Psychology"/>
                <option value = "History"/>
              </datalist>
            </label>
            
            {/*Location input*/}
            <label className="form-label">Location:
              <input
                type = "text"
                name = "location"
                value = {createData.location}
                onChange = {handleChange}
                className={createError.locationError ? "form-input error-input" : "form-input"}
              />
              <div style={locationDisplayStyle} className='errorLabel' >Required</div>
            </label>
            
            {/*Weekly time input*/}
            <label className="form-label">Weekly Time Commitment (hours): 
              <input 
                type = "number" 
                name = "weeklyTime"
                min = "1" 
                max = "168" 
                value={createData.weeklyTime} 
                onChange={handleChange}
                className={createError.weeklyTimeError ? "form-input error-input" : "form-input"}
              />
              <div style={weeklyTimeDisplayStyle} className='errorLabel' >Required</div>
            </label>

            {/*Submit button*/}
            <input className="submitButton" type = "submit" value = "Submit"/>
          </form>
        </div>
    );
}
export default ProjectCreation;
