// Import necessary components and libraries
import { SplashScreen, Stack } from "expo-router"; // Expo Router for navigation and SplashScreen for app loading
import "./globals.css"; // Import global CSS styles
import { useEffect } from "react"; // React hook for side effects
import { useFonts } from 'expo-font'; // Hook to load custom fonts
import GlobalProvider from '@/context/GlobalProvider'; // Global context provider for managing app-wide state

// Prevent the splash screen from automatically hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Load custom fonts using the `useFonts` hook
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require('../assets/fonts/Poppins-Black.ttf'), // Black font weight
    "Poppins-ExtraBold": require('../assets/fonts/Poppins-ExtraBold.ttf'), // Extra bold font weight
    "Poppins-ExtraLight": require('../assets/fonts/Poppins-ExtraLight.ttf'), // Extra light font weight
    "Poppins-Light": require('../assets/fonts/Poppins-Light.ttf'), // Light font weight
    "Poppins-Medium": require('../assets/fonts/Poppins-Medium.ttf'), // Medium font weight
    "Poppins-Regular": require('../assets/fonts/Poppins-Regular.ttf'), // Regular font weight
    "Poppins-SemiBold": require('../assets/fonts/Poppins-SemiBold.ttf'), // Semi-bold font weight
    "Poppins-Thin": require('../assets/fonts/Poppins-Thin.ttf'), // Thin font weight
  });

  // Effect to handle font loading and splash screen behavior
  useEffect(() => {
    if (error) throw error; // Throw an error if font loading fails
    if (fontsLoaded) SplashScreen.hideAsync(); // Hide the splash screen once fonts are loaded
  }, [fontsLoaded, error]); // Dependencies: re-run when `fontsLoaded` or `error` changes

  // If fonts are not loaded and no error occurred, return `null` to show a blank screen
  if (!fontsLoaded && !error) return null;

  // Render the app layout
  return (
    <GlobalProvider>
      {/* Wrap the app in a global context provider */}
      <Stack>
        {/* Define the navigation stack */}
        <Stack.Screen name="index" options={{ headerShown: false }} /> {/* Home screen */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} /> {/* Authentication screens */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> {/* Tab navigation */}
        <Stack.Screen name="search/[query]" options={{ headerShown: false }} /> {/* Search screen */}
      </Stack>
    </GlobalProvider>
  );
}



