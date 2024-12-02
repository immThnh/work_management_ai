/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            height: {
                "screen-60": "calc(100vh - 60px)",
            },
            colors: {
                black: "#1C252E",
                // "gray-300": "#637381",
            },
        },
    },
    darkMode: "class",
};
