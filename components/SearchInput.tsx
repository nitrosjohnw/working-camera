// Import necessary components and libraries
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native'; // Core React Native components
import React, { useState } from 'react'; // React library and useState hook
import icons from '@/constants/icons'; // Import app-specific icons
import { router, usePathname } from 'expo-router'; // Router utilities for navigation and getting the current path

// Define the SearchInput component
// Props:
// - title: The label for the input field (not used in this implementation)
// - value: The current value of the input field (not used in this implementation)
// - placeholder: Placeholder text for the input field
// - handleChangeText: Function to handle text changes in the input field (not used in this implementation)
// - otherStyles: Additional styles for the container
// - initialQuery: Initial value for the search query
const SearchInput = ({
  title, // Label for the input field
  value, // Current value of the input field
  placeholder, // Placeholder text
  handleChangeText, // Function to handle text changes
  otherStyles, // Additional styles for the container
  initialQuery, // Initial value for the search query
  ...props // Additional props
}: {
  initialQuery: any;
  otherStyles: any;
  handleChangeText: any;
  title: string;
  value: any;
  placeholder: string;
}) => {
  const pathname = usePathname(); // Get the current path of the app
  const [query, setQuery] = useState(initialQuery || ''); // State to store the search query

  return (
    // Main container for the search input
    <View className="border-2 border-secondary w-full h-16 px-4 bg-white rounded-2xl focus:border-secondary items-center flex-row space-x-4">
      {/* Text input field */}
      <TextInput
        className="text-base mt-0.5 text-secondary flex-1 font-pregular" // Styling for the input field
        value={query} // Bind the input value to the state
        placeholder="Search for a video topic" // Placeholder text
        placeholderTextColor="red" // Placeholder text color
        onChangeText={(e) => setQuery(e)} // Update the query state on text change
      />
      {/* Search button */}
      <TouchableOpacity
        onPress={() => {
          if (!query) {
            // Show an alert if the search query is empty
            return Alert.alert('Missing Query', 'Please input something to the search bar');
          }
          // If the current path is a search page, update the query parameters
          if (pathname.startsWith('/search')) {
            router.setParams({ query });
          } else {
            // Otherwise, navigate to the search page with the query
            router.push(`/search/${query}`);
          }
        }}
      >
        {/* Search icon */}
        <Image
          source={icons.search} // Source for the search icon
          className="w-5 h-5" // Styling for the icon
          resizeMode="contain" // Ensure the icon fits within its container
        />
      </TouchableOpacity>
    </View>
  );
};

// Export the SearchInput component for use in other parts of the app
export default SearchInput;