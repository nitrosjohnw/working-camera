/** @type {import('tailwindcss').Config} */
// Export the Tailwind CSS configuration object
module.exports = {
  // Specify the paths to all of your component files for Tailwind to scan for class names
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],

  // Use the NativeWind preset for React Native compatibility
  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      // Extend the default color palette
      colors: {
        primary: "#040404", // Primary color (dark black)
        secondary: {
          DEFAULT: "#e22020", // Default secondary color (red)
          100: "#be4a4a", // Lighter shade of secondary color
          200: "#c15959", // Another lighter shade of secondary color
        },
        black: {
          DEFAULT: "#000", // Default black color
          100: "#1E1E2D", // Dark grayish black
          200: "#232533", // Slightly lighter grayish black
        },
        gray: {
          100: "#CDCDE0", // Light gray color
        },
      },

      // Extend the default font families
      fontFamily: {
        pthin: ["Poppins-Thin", "sans-serif"], // Thin weight of Poppins font
        pextralight: ["Poppins-ExtraLight", "sans-serif"], // Extra light weight
        plight: ["Poppins-Light", "sans-serif"], // Light weight
        pregular: ["Poppins-Regular", "sans-serif"], // Regular weight
        pmedium: ["Poppins-Medium", "sans-serif"], // Medium weight
        psemibold: ["Poppins-SemiBold", "sans-serif"], // Semi-bold weight
        pbold: ["Poppins-Bold", "sans-serif"], // Bold weight
        pextrabold: ["Poppins-ExtraBold", "sans-serif"], // Extra bold weight
        pblack: ["Poppins-Black", "sans-serif"], // Black weight
      },
    },
  },

  // Specify any plugins to use with Tailwind CSS (none added here)
  plugins: [],
};