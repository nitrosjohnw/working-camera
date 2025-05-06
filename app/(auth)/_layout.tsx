// Import necessary components and libraries
import { View, Text } from 'react-native'; // React Native components
import React from 'react'; // React library
import { Stack } from 'expo-router'; // Stack navigation from Expo Router
import { StatusBar } from 'expo-status-bar'; // StatusBar component for managing the app's status bar

// Define the AuthLayout component
const AuthLayout = () => {
  return (
    <>
      {/* Stack Navigator for authentication screens */}
      <Stack>
        {/* Sign-In Screen */}
        <Stack.Screen
          name="sign-in" // Route name for the sign-in screen
          options={{
            headerShown: false, // Hide the header for this screen
          }}
        />
        {/* Sign-Up Screen */}
        <Stack.Screen
          name="sign-up" // Route name for the sign-up screen
          options={{
            headerShown: false, // Hide the header for this screen
          }}
        />
      </Stack>

      {/* StatusBar configuration */}
      <StatusBar 
        backgroundColor="#e22020" // Set the background color of the status bar
        style="dark" // Set the status bar text/icons to dark mode
      />
    </>
  );
};

// Export the AuthLayout component for use in the app
export default AuthLayout;