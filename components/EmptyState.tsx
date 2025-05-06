// Import necessary components and libraries
import { View, Text, Image } from 'react-native'; // Core React Native components
import React from 'react'; // React library for building components
import icons from '@/constants/icons'; // Import app-specific icons
import CustomButton from './CustomButton'; // Import the reusable CustomButton component
import { router } from 'expo-router'; // Router for navigation

// Define the EmptyState component
// Props:
// - title: The main title to display in the empty state
// - subtitle: The subtitle or additional message to display
const EmptyState = ({ title, subtitle }: { title: string; subtitle: string }) => {
  return (
    // Main container for the empty state
    <View className="justify-center items-center px-4">
      {/* Display an image for the empty state */}
      <Image
        source={icons.search} // Source for the empty state image
        className="w-[270px] h-[215px]" // Styling for the image
        resizeMode="contain" // Ensure the image fits within its container
      />
      {/* Display the main title */}
      <Text className="text-3xl text-center font-psemibold text-white mt-2">
        {title} {/* Render the title passed as a prop */}
      </Text>
      {/* Display the subtitle */}
      <Text className="font-pmedium text-xl text-white">
        {subtitle} {/* Render the subtitle passed as a prop */}
      </Text>
      {/* Button to navigate to the upload screen */}
      <CustomButton
        title="Create Video" // Button text
        handlePress={() => router.push('/(tabs)/upload')} // Navigate to the upload screen
        containerStyles="w-full my-5" // Custom styles for the button container
        textStyles={undefined} // Optional custom styles for the button text
        isLoading={undefined} // Optional loading state
      />
    </View>
  );
};

// Export the EmptyState component for use in other parts of the app
export default EmptyState;