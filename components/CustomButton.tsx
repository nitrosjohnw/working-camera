// Import necessary components from React Native
import { TouchableOpacity, Text } from 'react-native';
import React from 'react';

// Define the CustomButton component
// Props:
// - title: The text to display on the button
// - handlePress: Function to execute when the button is pressed
// - containerStyles: Additional styles for the button container
// - textStyles: Additional styles for the button text
// - isLoading: Boolean to indicate if the button is in a loading state
const CustomButton = ({
  title, // Button text
  handlePress, // Function to handle button press
  containerStyles, // Custom styles for the button container
  textStyles, // Custom styles for the button text
  isLoading, // Loading state
}: {
  title: string;
  handlePress: any;
  containerStyles: any;
  textStyles: any;
  isLoading: any;
}) => {
  return (
    // TouchableOpacity for the button
    <TouchableOpacity
      onPress={handlePress} // Trigger the handlePress function when pressed
      activeOpacity={0.7} // Set the opacity when the button is pressed
      className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${
        isLoading ? 'opacity-50' : '' // Reduce opacity if the button is in a loading state
      }`}
      disabled={isLoading} // Disable the button if it is in a loading state
    >
      {/* Button text */}
      <Text className={`text-white font-psemibold text-lg ${textStyles}`}>
        {title} {/* Display the button title */}
      </Text>
    </TouchableOpacity>
  );
};

// Export the CustomButton component for use in other parts of the app
export default CustomButton;