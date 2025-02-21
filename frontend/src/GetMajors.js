// SOURCE: https://medium.com/use-react/frontend-files-7dc4d1cceab6
//        https://stackoverflow.com/questions/64936583/react-fetch-data-and-store-in-a-variable

import React from 'react';

/* Reads a file and returns its contents as a string.
   apiUrl: a string path of the file
*/
const getData = (apiUrl) => {
    return fetch(apiUrl)
        .then(response => response.text());
}

// Stores the file contents
let fileContents = await getData("Major-Categories.txt");

// Returns a string array of the file contents
function GetMajors(fileName) {
    var arr = fileContents.split(", ");
    return arr;
}

export default GetMajors;