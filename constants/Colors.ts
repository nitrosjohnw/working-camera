/**
 * This file defines the color palette used throughout the app.
 * Colors are organized into light and dark mode themes to support dynamic theming.
 * 
 * Note: There are alternative ways to style your app, such as:
 * - [Nativewind](https://www.nativewind.dev/)
 * - [Tamagui](https://tamagui.dev/)
 * - [Unistyles](https://reactnativeunistyles.vercel.app)
 */

// Define the primary tint color for light mode
const tintColorLight = '#0a7ea4'; // A blue shade used for selected icons and highlights in light mode

// Define the primary tint color for dark mode
const tintColorDark = '#fff'; // White color used for selected icons and highlights in dark mode

// Export the Colors object containing light and dark mode themes
export const Colors = {
  light: {
    text: '#11181C', // Text color for light mode (dark gray)
    background: '#fff', // Background color for light mode (white)
    tint: tintColorLight, // Highlight color for light mode
    icon: '#687076', // Default icon color for light mode (gray)
    tabIconDefault: '#687076', // Default tab icon color for light mode
    tabIconSelected: tintColorLight, // Selected tab icon color for light mode
  },
  dark: {
    text: '#ECEDEE', // Text color for dark mode (light gray)
    background: '#151718', // Background color for dark mode (dark gray/black)
    tint: tintColorDark, // Highlight color for dark mode
    icon: '#9BA1A6', // Default icon color for dark mode (light gray)
    tabIconDefault: '#9BA1A6', // Default tab icon color for dark mode
    tabIconSelected: tintColorDark, // Selected tab icon color for dark mode
  },
};