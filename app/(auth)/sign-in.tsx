// Import necessary components and libraries
import { View, Text, ScrollView, Image, Alert } from 'react-native'; // React Native components
import React, { useState } from 'react'; // React library and hooks
import { SafeAreaView } from 'react-native-safe-area-context'; // SafeAreaView for handling safe areas
import icons from '@/constants/icons'; // Import app icons
import FormField from '@/components/FormField'; // Custom form field component
import CustomButton from '@/components/CustomButton'; // Custom button component
import { Link, router } from 'expo-router'; // Expo Router for navigation
import { getCurrentUser, signIn } from '@/lib/appwrite'; // Appwrite functions for authentication
import { useGlobalContext } from '@/context/GlobalProvider'; // Global context for managing user state

// Define the SignIn component
const SignIn = () => {
    const { setUser, setIsLoggedIn } = useGlobalContext(); // Access global context functions

    // State for form inputs
    const [form, setForm] = useState({
        email: '', // Email input
        password: '', // Password input
    });

    // State to track submission status
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Function to handle form submission
    const submit = async () => {
        // Validate form inputs
        if (!form.email || !form.password) {
            Alert.alert('Error', 'Please fill in all fields'); // Show an alert if fields are empty
            return;
        }

        setIsSubmitting(true); // Set submitting state to true

        try {
            // Attempt to sign in the user
            await signIn(form.email, form.password);

            // Fetch the current user details after successful sign-in
            const result = await getCurrentUser();

            // Update global context with user details and login status
            setUser(result);
            setIsLoggedIn(true);

            // Navigate to the home screen
            router.replace('/(tabs)/home');
        } catch (error: unknown) {
            // Handle errors during sign-in
            if (error instanceof Error) {
                console.error('Sign-in Error:', error); // Log the error
                Alert.alert('Error', error.message || 'An unexpected error occurred during sign-in.'); // Show an alert with the error message
            } else {
                console.error('An unexpected error occurred:', error); // Log unknown errors
                Alert.alert('Error', 'An unknown error occurred during sign-in.'); // Show a generic error alert
            }
        } finally {
            setIsSubmitting(false); // Reset submitting state
        }
    };

    // Render the sign-in screen
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
                        Log in to FlipClipz
                    </Text>

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

                    {/* Sign-In Button */}
                    <CustomButton
                        title="Sign In" // Button text
                        handlePress={submit} // Function to handle button press
                        containerStyles="mt-7" // Additional styling for the button container
                        textStyles={undefined} // Optional text styling
                        isLoading={isSubmitting} // Show loading indicator if submitting
                    />

                    {/* Sign-Up Link */}
                    <View className="justify-center pt-5 flex-row gap-2">
                        <Text className="text-white text-lg">Don't have an account?</Text>
                        <Link href="/(auth)/sign-up" className="text-lg font-semibold text-secondary">
                            Sign Up
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Export the SignIn component for use in the app
export default SignIn;