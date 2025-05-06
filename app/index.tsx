// Import necessary components and libraries
import { Link } from "expo-router"; // For navigation between screens
import { Image, ScrollView, StatusBar, Text, View } from "react-native"; // Core React Native components
import { SafeAreaView } from "react-native-safe-area-context"; // Ensures content is displayed within safe areas
import icons from '@/constants/icons'; // Import app-specific icons
import CustomButton from "@/components/CustomButton"; // Custom button component
import { Redirect, router } from "expo-router"; // For redirection and navigation
import { useGlobalContext } from "@/context/GlobalProvider"; // Access global app state

export default function Index() {
  // Access global context to check loading and login status
  const { isLoading, isLoggedIn } = useGlobalContext();

  // Redirect to the home screen if the user is logged in and not loading
  if (!isLoading && isLoggedIn) return <Redirect href="/home" />;

  return (
    // SafeAreaView ensures content is displayed within the device's safe area
    <SafeAreaView className="bg-primary h-full">
      {/* ScrollView allows scrolling if content exceeds the screen height */}
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        {/* Main content container */}
        <View className="w-full justify-center items-center min-h-[85vh] px-4">
          {/* App logo */}
          <Image
            source={icons.logo} // Source for the logo image
            className="w-[130px] h-[84px]" // Styling for the logo
            resizeMode="contain" // Ensure the image fits within its container
          />
          {/* Decorative cards image */}
          <Image
            source={icons.cards} // Source for the cards image
            className="max-w-[380px] h-[300px]" // Styling for the image
            resizeMode="contain" // Ensure the image fits within its container
          />
          {/* Text content */}
          <View className="relative mt-5">
            {/* Main heading */}
            <Text className="text-3xl font-bold text-white text-center">
              Film and Share Seamlessly Today with{' '}
              <Text className="text-secondary">FlipClipz</Text>
            </Text>
            {/* Subheading */}
            <Text className="text-xl font-pregular text-white mt-7 text-center">
              Express yourself freely and capture your clipz with ease here on FlipClipz
            </Text>
            {/* Button to navigate to the sign-in screen */}
            <CustomButton
              title="Continue with Email" // Button text
              handlePress={() => router.push('/(auth)/sign-in')} // Navigate to the sign-in screen
              containerStyles="mt-7" // Styling for the button container
              textStyles={undefined} // Optional text styling
              isLoading={undefined} // Optional loading state
            />
          </View>
        </View>
      </ScrollView>
      {/* Set the status bar background color */}
      <StatusBar backgroundColor="#040404" />
    </SafeAreaView>
  );
}