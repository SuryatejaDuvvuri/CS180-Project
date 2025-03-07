import React, {useState} from 'react';


function Email({email,name,projName,type})
{
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const sendEmail = async(type) => {
        const subject = type === "accept" ?  `Congratulations! You’ve been accepted to ${projName}`
        : type === "reject" ? `Thank you for applying to ${projName}` : `Thank you for your interest in ${projName}`;

        try
        {
            const response = await fetch(`http://${API_BASE_URL}/api/send_email/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    name: name,
                    subject: subject,
                    type: type, 
                    project_name: projName,
                }),
            });
            const data = await response.json();
            if (response.ok) {

                alert(`Email sent to ${email}`);
            } else {
                console.error("Failed to send email:", data);
                alert("Error sending email");
            }
        }
        catch(error)
        {

        }
    }
    return (
        <div className="p-4">
        <h2 className="text-xl font-semibold mb-3">Send Email to {name}</h2>
        <div className="flex space-x-2">
            <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => sendEmail("accept")}
            >
                Accept
            </button>
            <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => sendEmail("reject")}
            >
                Reject
            </button>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => sendEmail("thanks")}
            >
                Thanks for Applying
            </button>
        </div>
    </div>
    );
}


export default Email;