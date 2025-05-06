// Import necessary components and libraries
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  RefreshControl, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from '@/constants/icons';
import EmptyState from '@/components/EmptyState';
import { getAllPosts } from '@/lib/appwrite';
import useAppwrite from '@/lib/useAppwrite';
import VideoCard from '@/components/VideoCard';
import { useGlobalContext } from '../../context/GlobalProvider';
import { router } from 'expo-router';

const Social = () => {
  // Access the global user context to get the current user
  const { user } = useGlobalContext();

  // Fetch all posts using the custom Appwrite hook
  const { data: posts, refetch } = useAppwrite(getAllPosts);

  // State to track refreshing status for pull-to-refresh functionality
  const [refreshing, setRefreshing] = useState(false);

  // Holds the sport selected when the "More" button is pressed
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  // Define the fixed list of sports categories
  const sportsCategories = [
    "Skateboarding",
    "BMX",
    "Climbing",
    "Surfing",
    "Snowboarding",
    "Skiing",
    "Other",
    "Scootering",
  ];

  // Function to handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true); // Set refreshing state to true
    await refetch(); // Refetch posts from the server
    setRefreshing(false); // Reset refreshing state
  };

  // When a sport is selected, filter posts by that sport
  if (selectedSport) {
    // Filter posts for the selected sport
    const sportPosts = posts.filter((post) => post.sport === selectedSport);

    // Sort sport posts by creation date in descending order (latest first)
    sportPosts.sort((a, b) =>
      a.$createdAt && b.$createdAt
        ? Number(new Date(b.$createdAt)) - Number(new Date(a.$createdAt))
        : 0
    );

    // Render the selected sport's posts
    return (
      <SafeAreaView className="bg-primary h-full">
        <View className="px-4 mt-6">
          <TouchableOpacity onPress={() => setSelectedSport(null)}>
            <Text className="text-white font-psemibold mb-4">Back</Text>
          </TouchableOpacity>
          <Text className="text-2xl text-white font-psemibold mb-4">
            {selectedSport}
          </Text>
        </View>
        <FlatList
          data={sportPosts} // Data for the FlatList
          keyExtractor={(item) => item.$id} // Unique key for each item
          renderItem={({ item }) => <VideoCard video={item} />} // Render each video using the VideoCard component
          ListEmptyComponent={() => (
            <EmptyState
              title="No Videos Found" // Title for the empty state
              subtitle="No videos for this sport yet" // Subtitle for the empty state
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </SafeAreaView>
    );
  }

  // Group posts by sport category
  const groupedBySport = posts?.reduce((acc, post) => {
    const sport = post.sport; // Get the sport category of the post
    if (!acc[sport]) {
      acc[sport] = []; // Initialize an array for the sport if it doesn't exist
    }
    acc[sport].push(post); // Add the post to the corresponding sport category
    return acc;
  }, {} as Record<string, any[]>) || {};

  // Sort each group of posts by creation date in descending order (latest first)
  Object.keys(groupedBySport).forEach((sport) => {
    groupedBySport[sport].sort((a, b) => {
      if (a.$createdAt && b.$createdAt) {
        return Number(new Date(b.$createdAt)) - Number(new Date(a.$createdAt));
      }
      return 0;
    });
  });

  // Render the main screen with grouped sports categories
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView
        className="px-4 mt-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        <View className="my-6 px-4 space-y-6">
          <View className="flex-row justify-center items-center mb-6">
            <View className="mt-1.5">
              <Image
                source={icons.logo} // Source for the app logo
                className="w-12 h-12" // Styling for the logo
                resizeMode="contain" // Ensure the image fits within its container
              />
            </View>
          </View>
        </View>

        {sportsCategories.map((sport) => {
          // Get posts for this sport if available
          const sportPosts = groupedBySport[sport] || [];
          return (
            <View key={sport} className="mb-8">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-2xl text-white font-psemibold">
                  {sport}
                </Text>
                {sportPosts.length > 0 && (
                  <TouchableOpacity onPress={() => setSelectedSport(sport)}>
                    <Text className="text-white">More</Text>
                  </TouchableOpacity>
                )}
              </View>
              {sportPosts.length > 0 ? (
                <VideoCard video={sportPosts[0]} /> // Render the latest video for the sport
              ) : (
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/upload')} // Navigate to the upload screen
                  className="p-4 border border-dashed border-gray-500 rounded-lg"
                >
                  <Text className="text-white text-center">
                    No videos yet, be the first to upload
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Social;