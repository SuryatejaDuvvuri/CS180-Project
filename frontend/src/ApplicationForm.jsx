import React, { useState } from 'react';
import './ApplicationForm.css';

const ApplicationForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        position: '',
        resume: '',
    });

    return (
        <div className="form-container">
            <form> 
                <input className="input-field" placeholder="Name" /><br/>
                <input className="input-field" placeholder="Email" /><br/>
                <input className="input-field" placeholder="Phone" /><br/>
                <input className="input-field" placeholder="Position" /><br/>
                <input type="file" /><br/>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

    export default ApplicationForm;