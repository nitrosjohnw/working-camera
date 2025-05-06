// Import necessary components and libraries
import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import SearchInput from '@/components/SearchInput'; // Custom search input component
import EmptyState from '@/components/EmptyState'; // Component to display when no data is found
import { searchPosts } from '@/lib/appwrite'; // Function to search posts from Appwrite
import useAppwrite from '@/lib/useAppwrite'; // Custom hook for Appwrite API calls
import VideoCard from '@/components/VideoCard'; // Component to display video details
import { Stack, useLocalSearchParams } from 'expo-router'; // Expo Router utilities

const Search = () => {
  // Extract the query parameter from the URL
  const { query } = useLocalSearchParams();

  // Fetch posts matching the query using the custom Appwrite hook
  const { data: posts, refetch } = useAppwrite(() => searchPosts(query));

  // State to track the refreshing status for pull-to-refresh functionality
  const [refreshing, setRefreshing] = useState(false);

  // Refetch posts whenever the query changes
  useEffect(() => {
    refetch();
  }, [query]);

  return (
    <GestureHandlerRootView>
      {/* Hide the default header */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Main container with a safe area */}
      <SafeAreaView className="bg-primary h-full">
        {/* FlatList to display the list of posts */}
        <FlatList
          data={posts} // Data to render in the list
          keyExtractor={(item) => item.$id} // Unique key for each item
          renderItem={({ item }) => (
            <VideoCard video={item} /> // Render each video using the VideoCard component
          )}
          ListHeaderComponent={() => (
            // Header section for the search results
            <View className="my-6 px-4">
              <Text className="font-pmedium text-m text-white">
                Search Results
              </Text>
              <Text className="text-3xl font-psemibold text-white">
                {query}
              </Text>
              <View className="mt-6 mb-8">
                {/* Search input field */}
                <SearchInput
                  initialQuery={query} // Pre-fill the search input with the current query
                  otherStyles={undefined}
                  handleChangeText={undefined}
                  title={''}
                  value={undefined}
                  placeholder={''}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            // Component to display when no posts are found
            <EmptyState
              title="No Videos Found" // Title for the empty state
              subtitle="No Videos Found" // Subtitle for the empty state
            />
          )}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Search;