// Import necessary components and libraries
import { View, Text, Image, RefreshControl, TouchableOpacity, Alert } from 'react-native'; // React Native components
import React, { useEffect, useState } from 'react'; // React library and hooks
import { SafeAreaView } from 'react-native-safe-area-context'; // SafeAreaView for handling safe areas
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler'; // Gesture handler components
import EmptyState from '../../components/EmptyState'; // Empty state component for no data
import { getCurrentUser, getUserPosts, searchPosts, signOut } from '../../lib/appwrite'; // Appwrite functions for user and post management
import useAppwrite from '../../lib/useAppwrite'; // Custom hook for Appwrite API calls
import VideoCard from '../../components/VideoCard'; // Video card component for rendering videos
import { useGlobalContext } from '../../context/GlobalProvider'; // Global context for managing user state
import icons from '@/constants/icons'; // Import app icons
import InfoBox from '../../components/InfoBox'; // Custom component for displaying user info
import { router } from 'expo-router'; // Expo Router for navigation

// Define the Profile component
const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext(); // Access global context functions
  console.log("Global Context:", { user, setUser, setIsLoggedIn });

  // Fetch posts created by the current user using the custom Appwrite hook
  const { data: posts } = useAppwrite(() => getUserPosts(user.$id));

  // Function to handle user logout
  const logout = async () => {
    try {
      console.log("Checking if user is logged in...");
      const currentUser = await getCurrentUser(); // Ensure user is logged in

      if (!currentUser) {
        console.warn("No active session found. Redirecting to Sign-In...");
        setUser(null); // Clear user data in global context
        setIsLoggedIn(false); // Update login status in global context
        router.replace('/(auth)/sign-in'); // Redirect to the sign-in screen
        return;
      }

      console.log("Logging out user...");
      await signOut(); // Sign out the user
      setUser(null); // Clear user data in global context
      setIsLoggedIn(false); // Update login status in global context
      router.replace('/(auth)/sign-in'); // Redirect to the sign-in screen
    } catch (error) {
      console.error("Logout Error:", error); // Log the error
      Alert.alert("Logout Failed", error.message || "Something went wrong while logging out."); // Show an alert with the error message
    }
  };

  // State to track refreshing status for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  return (
    <GestureHandlerRootView>
      <SafeAreaView className="bg-primary h-full">
        <FlatList
          data={posts} // Data for the list
          keyExtractor={(item) => item.$id} // Unique key for each item
          renderItem={({ item }) => (
            <VideoCard video={item} /> // Render each video using the VideoCard component
          )}
          ListHeaderComponent={() => (
            <View className="w-full justify-center items-center mt-6 mb-12 px-4">
              <TouchableOpacity
                className="w-full items-end mb-10"
                onPress={logout} // Handle logout when pressed
              >
                <Image
                  source={icons.logout} // Logout icon
                  resizeMode="contain" // Ensure the image fits within its container
                  className="w-6 h-6" // Icon size
                />
              </TouchableOpacity>

              {/* User Avatar */}
              <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
                <Image
                  source={{ uri: user?.avatar }} // User avatar source
                  className="w-[90%] h-[90%] rounded-lg" // Styling for the avatar
                  resizeMode="cover" // Ensure the image covers the container
                />
              </View>

              {/* User Info */}
              <InfoBox
                title={user?.username} // Display the username
                containerStyles="mt-5" // Additional styling for the container
                titleStyles="text-lg" // Styling for the title
                subtitle={undefined} // No subtitle for this InfoBox
              />

              {/* User Stats */}
              <View className="flex-row mt-5">
                <InfoBox
                  title={posts.length || 0} // Display the number of posts
                  subtitle="Posts" // Subtitle for the InfoBox
                  containerStyles="mr-10" // Additional styling for the container
                  titleStyles="text-xl" // Styling for the title
                />
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <EmptyState
              title="No Videos Found" // Title for the empty state
              subtitle="No videos found" // Subtitle for the empty state
            />
          )}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

// Export the Profile component for use in the app
export default Profile;