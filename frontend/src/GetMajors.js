import { useState, useEffect } from "react";

// Function to fetch data from the file
const getData = async (apiUrl) => {
    try {
        const response = await fetch(apiUrl);
        const text = await response.text();
        return text;
    } catch (error) {
        console.error("Error fetching majors:", error);
        return "";
    }
};

// Custom Hook to get majors
export function useMajors() {
    const [majors, setMajors] = useState([]);

    useEffect(() => {
        async function fetchMajors() {
            const fileContents = await getData("/Major-Categories.txt");
            setMajors(fileContents.split(", ").map((major) => major.trim()));
        }

        fetchMajors();
    }, []);

    return majors;
}

// Function that returns majors
export async function GetMajors() {
    const fileContents = await getData("/Major-Categories.txt");
    return fileContents.split(", ").map((major) => major.trim());
};

export default useMajors;