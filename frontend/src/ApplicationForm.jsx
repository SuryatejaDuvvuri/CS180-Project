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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        alert('Form submitted');
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <input className="input-field" name="name" value={formData.name} onChange={handleChange} placeholder="Name" /><br />
                <input className="input-field" name="email" value={formData.email} onChange={handleChange} placeholder="Email" /><br />
                <input className="input-field" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" /><br />
                <input className="input-field" name="position" value={formData.position} onChange={handleChange} placeholder="Position" /><br />
                <input type="file" /><br />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default ApplicationForm;