// Import necessary components and libraries
import { View, Text, ScrollView, Image, Alert, TouchableOpacity } from 'react-native'; // React Native components
import React, { useState } from 'react'; // React library and hooks
import { SafeAreaView } from 'react-native-safe-area-context'; // SafeAreaView for handling safe areas
import icons from '@/constants/icons'; // Import app icons
import FormField from '@/components/FormField'; // Custom form field component
import CustomButton from '@/components/CustomButton'; // Custom button component
import { Link, router } from 'expo-router'; // Expo Router for navigation
import { createUser } from '@/lib/appwrite'; // Appwrite function to create a new user
import { useGlobalContext } from '@/context/GlobalProvider'; // Global context for managing user state

// Define the SignUp component
const SignUp = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext(); // Access global context functions

  // State for form inputs
  const [form, setForm] = useState({
    username: '', // Username input
    email: '', // Email input
    password: '', // Password input
  });

  // State to track submission status
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State to track whether the user has accepted the Terms of Service
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Function to handle form submission
  const submit = async () => {
    // Validate form inputs
    if (!form.username || !form.email || !form.password) {
      return Alert.alert('Error', 'Please fill in all fields'); // Show an alert if fields are empty
    }

    // Validate Terms of Service acceptance
    if (!acceptedTerms) {
      return Alert.alert('Error', 'Please accept the Terms of Service'); // Show an alert if terms are not accepted
    }

    setIsSubmitting(true); // Set submitting state to true

    try {
      // Create a new user using the Appwrite function
      const result = await createUser(form.email, form.password, form.username);

      // Update global context with user details and login status
      setUser(result);
      setIsLoggedIn(true);

      // Navigate to the home screen
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error'); // Show a generic error alert
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  // Render the sign-up screen
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          {/* App Logo */}
          <Image
            source={icons.logo} // App logo source
            className="w-[130px] h-[84px]" // Styling for the logo
            resizeMode="contain" // Ensure the image fits within its container
          />

          {/* Screen Title */}
          <Text className="text-3xl text-white font-semibold mt-10">
            Sign Up to FlipClipz
          </Text>

          {/* Username Input Field */}
          <FormField
            title="Username" // Label for the input field
            value={form.username} // Bind the username state
            handleChangeText={(e: string) => setForm({ ...form, username: e })} // Update username state on input change
            otherStyles="mt-10" // Additional styling
            placeholder="Enter your username" // Placeholder text
          />

          {/* Email Input Field */}
          <FormField
            title="Email" // Label for the input field
            value={form.email} // Bind the email state
            handleChangeText={(e: string) => setForm({ ...form, email: e })} // Update email state on input change
            otherStyles="mt-7" // Additional styling
            placeholder="Enter your email" // Placeholder text
          />

          {/* Password Input Field */}
          <FormField
            title="Password" // Label for the input field
            value={form.password} // Bind the password state
            handleChangeText={(e: string) => setForm({ ...form, password: e })} // Update password state on input change
            otherStyles="mt-7" // Additional styling
            placeholder="Enter your password" // Placeholder text
          />

          {/* Terms of Service Acknowledgement */}
          <TouchableOpacity
            onPress={() => setAcceptedTerms(!acceptedTerms)} // Toggle acceptance state
            className="flex-row items-center mt-5"
          >
            <View
              className={`w-5 h-5 mr-2 border-2 border-white ${
                acceptedTerms ? 'bg-white' : '' // Show a filled box if terms are accepted
              }`}
            />
            <Text className="text-white text-sm">
              I accept the{' '}
              <Link href="/terms" className="text-secondary underline">
                Terms of Service
              </Link>
            </Text>
          </TouchableOpacity>

          {/* Sign-Up Button */}
          <CustomButton
            title="Sign Up" // Button text
            handlePress={submit} // Function to handle button press
            containerStyles="mt-7" // Additional styling for the button container
            textStyles={undefined} // Optional text styling
            isLoading={isSubmitting} // Show loading indicator if submitting
          />

          {/* Sign-In Link */}
          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-white text-lg">Already have an account?</Text>
            <Link href="/(auth)/sign-in" className="text-lg font-semibold text-secondary">
              Sign In
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Export the SignUp component for use in the app
export default SignUp;