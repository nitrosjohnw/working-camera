// Disable the header for this screen
export const unstable_settings = {
  headerShown: false,
};

// Import necessary components and libraries
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider'; // Access global user context
import { getUserPosts, getCommentsForVideo } from '@/lib/appwrite'; // API functions for fetching posts and comments
import VideoCard from '@/components/VideoCard'; // Component to display video details

// Define the structure of a notification item
type NotificationItem = {
  id: string; // Unique identifier for the notification
  type: 'like' | 'comment'; // Type of notification (like or comment)
  message: string; // Notification message
  createdAt: string; // Timestamp of the notification
  post: any; // The video object associated with this notification
};

const Notifications = () => {
  const { user } = useGlobalContext(); // Get the current user from the global context
  const [notifications, setNotifications] = useState<NotificationItem[]>([]); // State to store notifications
  const [refreshing, setRefreshing] = useState(false); // State to track pull-to-refresh status
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null); // Track expanded notification

  // Fetch notifications for the current user
  const fetchNotifications = async () => {
    try {
      // Fetch videos created by the current user
      const posts = await getUserPosts(user.$id);
      let notifs: NotificationItem[] = [];

      // Process each post to generate notifications
      await Promise.all(
        posts.map(async (post) => {
          // Add a notification for likes
          if (post.likedBy && Array.isArray(post.likedBy) && post.likedBy.length > 0) {
            notifs.push({
              id: post.$id + '-likes',
              type: 'like',
              message: `Your video "${post.title}" received ${post.likedBy.length} like${post.likedBy.length > 1 ? 's' : ''}.`,
              createdAt: post.$createdAt || new Date().toISOString(),
              post: post,
            });
          }

          // Add a notification for comments
          try {
            const commentsForPost = await getCommentsForVideo(post.$id);
            if (commentsForPost && commentsForPost.length > 0) {
              notifs.push({
                id: post.$id + '-comments',
                type: 'comment',
                message: `Your video "${post.title}" has ${commentsForPost.length} comment${commentsForPost.length > 1 ? 's' : ''}.`,
                createdAt: post.$createdAt || new Date().toISOString(),
                post: post,
              });
            }
          } catch (error) {
            console.error("Error fetching comments for post", post.$id, error);
          }
        })
      );

      // Sort notifications by creation date in descending order
      notifs.sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)));
      setNotifications(notifs); // Update the notifications state
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Handle pull-to-refresh functionality
  const onRefresh = async () => {
    setRefreshing(true); // Set refreshing state to true
    await fetchNotifications(); // Fetch notifications
    setRefreshing(false); // Reset refreshing state
  };

  // Fetch notifications when the user is available
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Handle notification press to toggle expansion
  const handleNotificationPress = (item: NotificationItem) => {
    setExpandedNotificationId(expandedNotificationId === item.id ? null : item.id); // Toggle expansion
  };

  // Render a single notification item
  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isExpanded = expandedNotificationId === item.id; // Check if the notification is expanded
    return (
      <>
        <TouchableOpacity
          onPress={() => handleNotificationPress(item)} // Handle notification press
          className="p-4 border-b border-gray-600"
        >
          {/* Notification type */}
          <Text className="text-white font-bold">
            {item.type === 'like' ? 'New Like' : 'New Comment'} 
          </Text>
          {/* Notification message */}
          <Text className="text-white">{item.message}</Text> 
          {/* Notification timestamp */}
          <Text className="text-gray-400 text-xs">
            {new Date(item.createdAt).toLocaleString()} 
          </Text>
        </TouchableOpacity>
        {/* Display the associated video */}
        {isExpanded && (
          <View className="p-4">
            <VideoCard video={item.post} /> 
          </View>
        )}
      </>
    );
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <Stack.Screen options={{ headerShown: false }} /> {/* Hide the header */}
      <SafeAreaView className="flex-1 bg-black">
        {/* Back button */}
        <View className="p-4 border-b border-secondary">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-secondary font-bold text-xl">Back</Text>
          </TouchableOpacity>
        </View>
        {/* List of notifications */}
        <FlatList
          data={notifications} // Notifications data
          keyExtractor={(item) => item.id} // Unique key for each notification
          renderItem={renderItem} // Render each notification
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // Pull-to-refresh control
          }
          ListEmptyComponent={
            <View className="p-4 items-center justify-center">
              <Text className="text-white">No notifications yet</Text> {/* Empty state message */}
            </View>
          }
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Notifications;