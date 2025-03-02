// SOURCE: https://medium.com/use-react/frontend-files-7dc4d1cceab6
//        https://stackoverflow.com/questions/64936583/react-fetch-data-and-store-in-a-variable

import React from 'react';
import { useState, useEffect } from 'react';

/* Reads a file and returns its contents as a string.
   apiUrl: a string path of the file
*/
// const getData = (apiUrl) => {
//     return fetch(apiUrl)
//         .then(response => response.text());
// }

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

// Stores the file contents
// let fileContents = await getData("frontend/public/Major-Categories.txt");

// Returns a string array of the file contents
function GetMajors() {
    const [majors, setMajors] = useState([]);

    useEffect(() => {
        async function fetchMajors() {
            const fileContents = await getData(`Major-Categories.txt`);
            setMajors(fileContents.split(", ").map((major) => major.trim()));
        }

        fetchMajors();
    }, []); 

    return majors;
}

export default GetMajors;