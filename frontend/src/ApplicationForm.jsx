import React, { useState } from 'react';

const ApplicationForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        position: '',
        resume: '',
    });

    return (
        <div>
            <form> 
                <input placeholder="Name" /><br/>
                <input placeholder="Email" /><br/>
                <input placeholder="Phone" /><br/>
                <input placeholder="Position" /><br/>
                <input type="file" /><br/>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

    export default ApplicationForm;