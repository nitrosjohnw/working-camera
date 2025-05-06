// Import necessary components and libraries
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'; // Core React Native components
import React, { useState } from 'react'; // React library and useState hook
import icons from '@/constants/icons'; // Import app-specific icons

// Define the FormField component
// Props:
// - title: The label for the input field
// - value: The current value of the input field
// - placeholder: Placeholder text for the input field
// - handleChangeText: Function to handle text changes in the input field
// - otherStyles: Additional styles for the container
const FormField = ({
  title, // Label for the input field
  value, // Current value of the input field
  placeholder, // Placeholder text
  handleChangeText, // Function to handle text changes
  otherStyles, // Additional styles for the container
  ...props // Additional props
}: {
  otherStyles: any;
  handleChangeText: any;
  title: string;
  value: any;
  placeholder: string;
}) => {
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  return (
    // Main container for the form field
    <View className={`space-y-2 ${otherStyles}`}>
      {/* Label for the input field */}
      <Text className="text-base text-white font-pmedium">{title}</Text>

      {/* Input field container */}
      <View className="border-2 border-red-500 w-full h-16 px-4 bg-white rounded-2xl focus:border-secondary items-center flex-row">
        {/* Text input field */}
        <TextInput
          className="flex-1 text-secondary font-psemibold text-base" // Styling for the input field
          value={value} // Bind the input value to the state
          placeholder={placeholder} // Placeholder text
          placeholderTextColor="#e22020" // Placeholder text color
          onChangeText={handleChangeText} // Handle text changes
          secureTextEntry={title === 'Password' && !showPassword} // Hide text for password fields unless toggled
        />

        {/* Toggle password visibility for password fields */}
        {title === 'Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {/* Show the appropriate icon based on the visibility state */}
            <Image
              source={!showPassword ? icons.eye : icons.eyeHide} // Eye icon for visibility toggle
              className="w-6 h-6" // Styling for the icon
              resizeMode="contain" // Ensure the icon fits within its container
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Export the FormField component for use in other parts of the app
export default FormField;