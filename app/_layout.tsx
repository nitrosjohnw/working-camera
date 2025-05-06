import { SplashScreen, Stack } from "expo-router"; // Import SplashScreen and Stack for navigation
import "./globals.css"; // Import global CSS styles
import { useEffect } from "react"; // Import React's useEffect hook
import { useFonts } from 'expo-font'; // Import useFonts hook to load custom fonts
import GlobalProvider from '@/context/GlobalProvider'; // Import GlobalProvider for app-wide state management

// Prevent the splash screen from automatically hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Load custom fonts using the useFonts hook
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

  // useEffect to handle font loading and splash screen behavior
  useEffect(() => {
    if (error) throw error; // Throw an error if font loading fails
    if (fontsLoaded) SplashScreen.hideAsync(); // Hide the splash screen once fonts are loaded
  }, [fontsLoaded, error]); // Dependencies: re-run when fontsLoaded or error changes

  // If fonts are not loaded and no error occurred, return null to show a blank screen
  if (!fontsLoaded && !error) return null;

  // Render the app layout
  return (
    // Wrap the entire app in the GlobalProvider for context management
    // All screens have their headers hidden for a cleaner look
    <GlobalProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} /> 
        <Stack.Screen name="(auth)" options={{ headerShown: false }} /> 
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> 
        <Stack.Screen name="search/[query]" options={{ headerShown: false }} /> 
      </Stack>
    </GlobalProvider>
  );
}