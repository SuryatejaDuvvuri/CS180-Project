import React, {useState, useEffect} from 'react';

function Feedback()
{
    const [feedback,setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const sendFeedback = async (email, name, feedback, improvements) => 
    {
        try
        {
            const response = await fetch("http://localhost:8000/api/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    name: name,
                    experiences: feedback,
                    improvements: improvements,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to send email");
            }
            setFeedback(Array.isArray(data) ? data : []);
        }
        catch (err)
        {
            console.err("Error: ",err);
        }
    }

    const fetchFeedback = async () => 
    {
        setLoading(true);
        try
        {
            const response = await fetch("http://localhost:8000/api/feedback/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            setFeedback(data);
        }
        catch(e)
        {
            setError(e);
            setFeedback([]);
            console.error("Error fetching data");
        }
        finally
        {
            setLoading(false);
        }
    }

    return (
        <div className="bg-gray-100 p-5">
            <h1 className="text-3xl font-bold text-center mb-5">User Feedback</h1>

            {error && <p className="text-red-500">{error}</p>}
            {loading ? (
                <p className="text-center">Loading feedback...</p>
            ) : (
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-blue-500 text-white">
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Experience</th>
                            <th className="px-4 py-2">Improvements</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {Array.isArray(feedback) && feedback.map((feedback, index) => (
                            <tr key={feedback.id || `fallback-${index}`} className="border-t">
                                <td className="px-4 py-2">{feedback.name}</td>
                                <td className="px-4 py-2">{feedback.email}</td>
                                <td className="px-4 py-2">{feedback.experience}</td>
                                <td className="px-4 py-2">{feedback.improvements}</td>
                                <td className="px-4 py-2">
                                    <button
                                        className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                                        onClick={() => sendFeedback(feedback.email, feedback.name, feedback.experience, feedback.improvements)}
                                    >
                                        Thank You
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Feedback;