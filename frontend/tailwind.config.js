/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",  
      "./public/index.html",
    ],
    theme: {
      extend: {
        colors: {
        websiteBackground: "#C1D4F1",
        mainColor: "#0C60DC",
        accColor: "#8B9BF0",
        headerShadow: "#1C4684",
        hoverColor: "#f5ad42",
        gradientLeftLight: "rgb(255, 0, 0)",
        gradientRightLight: "rgb(255, 149, 0)",
        websiteBackgroundDark: "#141517",
        mainColorDark: "#1C4684",
        accColorDark: "#5a659d",
        headerShadowDark: "#102544",
        gradientLeftDark: "rgb(0, 115, 255)",
        gradientRightDark: "rgb(74, 204, 255)",
      },
    },
    },
    plugins: [],
  };
  