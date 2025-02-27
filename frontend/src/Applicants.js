import React, {useState, useEffect} from 'react';
import Email from './Email';

function Applicants()
{
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchApplicants();
    }, []);

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/api/applicants/",{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
            },
        });
            const data = await response.json();

            if (!Array.isArray(data.applicants)) {
                throw new Error("Invalid response format: applicants is not an array.");
            }

            setApplicants(data.applicants);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching applicants:", err);
            setApplicants([]);
        } finally {
            setLoading(false);
        }
    };

    const sendEmail = async(email,name,projName,type) => {
        const subject = type === "accept" ?  `Congratulations! You’ve been accepted to ${projName}`
        : type === "reject" ? `Thank you for applying to ${projName}` : `Thank you for your interest in ${projName}`;

        try
        {
            const response = await fetch("http://localhost:8000/api/send_email/", {
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
                console.log(`Email sent successfully: ${data.message}`);
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
        <div className="bg-gray-100 min-h-screen p-5">
            <h1 className="text-3xl font-bold text-center mb-5">Applicants</h1>

            {error && <p className="text-red-500">{error}</p>}
            {loading ? (
                <p className="text-center">Loading applicants...</p>
            ) : (
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-blue-500 text-white">
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Project</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applicants.length > 0 ? (
                            applicants.map((applicant, index) => (
                                <tr key={applicant.id || `fallback-key-${index}`} className="border-t">
                                    <td className="px-4 py-2">{applicant.name}</td>
                                    <td className="px-4 py-2">{applicant.email}</td>
                                    <td className="px-4 py-2">{applicant.project_name}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                                            onClick={() =>
                                                sendEmail("duvvurisuryateja95@gmail.com", applicant.name, applicant.project_name, "accept")
                                            }
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-3 py-1 rounded"
                                            onClick={() =>
                                                sendEmail("duvvurisuryateja95@gmail.com", applicant.name, applicant.project_name, "reject")
                                            }
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    No applicants available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Applicants;