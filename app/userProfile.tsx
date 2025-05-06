// Import necessary components and libraries
import { 
  View, 
  Text, 
  Image, 
  RefreshControl, 
  TouchableOpacity 
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useLocalSearchParams } from 'expo-router';
import EmptyState from '@/components/EmptyState';
import { getUserAndPosts, getFilePreview } from '@/lib/appwrite';
import VideoCard from '@/components/VideoCard';
import { router } from 'expo-router';
import icons from '@/constants/icons';
import InfoBox from '@/components/InfoBox';

const UserProfile = () => {
  // Extract user IDs from the URL parameters
  const { passedUserId, userId } = useLocalSearchParams<{ passedUserId?: string; userId?: string }>();
  const effectiveUserId = passedUserId || userId; // Use `passedUserId` if available, otherwise fallback to `userId`

  // Log the effective user ID whenever it changes
  useEffect(() => {
    console.log('Passed user id:', effectiveUserId);
  }, [effectiveUserId]);

  // If no user ID is provided, display an error message
  if (!effectiveUserId) {
    return (
      <SafeAreaView className="bg-primary h-full flex-1 justify-center items-center">
        <Text className="text-white">Error: No user specified.</Text>
      </SafeAreaView>
    );
  }

  // State to store user data and posts
  const [data, setData] = useState<{ user: any; posts: any[] } | null>(null);
  const [refreshing, setRefreshing] = useState(false); // State to track pull-to-refresh status
  const [error, setError] = useState<string | null>(null); // State to store error messages

  // Fetch user data and posts from the server
  const fetchData = async () => {
    try {
      const result = await getUserAndPosts(effectiveUserId); // Fetch user and posts
      setData(result); // Update the state with fetched data
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error("Error fetching user and posts:", err);
      setError(err.message || "Error fetching user and posts"); // Set error message
    }
  };

  // Fetch data whenever the effective user ID changes
  useEffect(() => {
    fetchData();
  }, [effectiveUserId]);

  // Handle pull-to-refresh functionality
  const onRefresh = async () => {
    setRefreshing(true); // Set refreshing state to true
    await fetchData(); // Fetch data
    setRefreshing(false); // Reset refreshing state
  };

  // Generate initials from the user's name
  const generateInitials = (name: string) => {
    if (!name) return ''; // Return an empty string if no name is provided
    const nameParts = name.split(' '); // Split the name into parts
    const initials = nameParts.map((part) => part[0]).join('').toUpperCase(); // Get the first letter of each part
    return initials.slice(0, 2); // Limit to 2 initials
  };

  // Display an error message if an error occurs
  if (error) {
    return (
      <SafeAreaView className="bg-primary h-full flex-1 justify-center items-center">
        <Text className="text-white">{error}</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-white underline">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Display a loading message while data is being fetched
  if (!data) {
    return (
      <SafeAreaView className="bg-primary h-full flex-1 justify-center items-center">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Hide the default header */}
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="bg-primary h-full">
        {/* Back button */}
        <View className="absolute top-20 left-4">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-bold text-lg">Back</Text>
          </TouchableOpacity>
        </View>

        {/* List of user posts */}
        <FlatList
          data={data.posts} // Display the user's posts
          keyExtractor={(item) => item.$id} // Unique key for each post
          renderItem={({ item }) => <VideoCard video={item} />} // Render each post using the VideoCard component
          ListHeaderComponent={() => (
            <View className="w-full justify-center items-center mt-6 mb-12 px-4">
              {/* Back button header */}
              <TouchableOpacity
                className="w-full items-start mb-10"
                onPress={() => router.back()}
              >
                <Image
                  source={icons.back} // Back button icon
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </TouchableOpacity>
              {/* Avatar above the name */}
              <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center bg-secondary">
                <Text className="text-white text-lg font-bold">
                  {generateInitials(data.user.username)} {/* Display user initials */}
                </Text>
              </View>
              {/* User's name */}
              <InfoBox
                title={data.user.username} // Display the user's name
                containerStyles="mt-5"
                titleStyles="text-lg"
                subtitle={undefined}
              />
              {/* Posts and Followers */}
              <View className="flex-row mt-5">
                <InfoBox
                  title={data.posts.length || 0} // Display the number of posts
                  subtitle="Posts"
                  containerStyles="mr-10"
                  titleStyles="text-xl"
                />
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <EmptyState
              title="No Videos Found" // Message when no posts are available
              subtitle="No videos found"
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} // Pull-to-refresh control
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default UserProfile; // Export the UserProfile component