export const unstable_settings = {
  headerShown: false,
};

import React, { useEffect, useState, } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getUserPosts, getCommentsForVideo } from '@/lib/appwrite';
import VideoCard from '@/components/VideoCard';

type NotificationItem = {
  id: string;
  type: 'like' | 'comment';
  message: string;
  createdAt: string;
  post: any; // The video object associated with this notification
};

const Notifications = () => {
  const { user } = useGlobalContext();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  // Track which notification is currently expanded.
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      // Fetch videos created by the current user.
      const posts = await getUserPosts(user.$id);
      let notifs: NotificationItem[] = [];

      await Promise.all(
        posts.map(async (post) => {
          // Notification for likes.
          if (post.likedBy && Array.isArray(post.likedBy) && post.likedBy.length > 0) {
            notifs.push({
              id: post.$id + '-likes',
              type: 'like',
              message: `Your video "${post.title}" received ${post.likedBy.length} like${post.likedBy.length > 1 ? 's' : ''}.`,
              createdAt: post.$createdAt || new Date().toISOString(),
              post: post,
            });
          }
          // Notification for comments.
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

      // Sort notifications by createdAt descending.
      notifs.sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)));
      setNotifications(notifs);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleNotificationPress = (item: NotificationItem) => {
    // Toggle expansion: collapse if already expanded, otherwise expand it.
    setExpandedNotificationId(expandedNotificationId === item.id ? null : item.id);
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isExpanded = expandedNotificationId === item.id;
    return (
      <>
        <TouchableOpacity
          onPress={() => handleNotificationPress(item)}
          className="p-4 border-b border-gray-600"
        >
          <Text className="text-white font-bold">
            {item.type === 'like' ? 'New Like' : 'New Comment'}
          </Text>
          <Text className="text-white">{item.message}</Text>
          <Text className="text-gray-400 text-xs">
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </TouchableOpacity>
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
      <Stack.Screen options={{ headerShown: false }}/>
      <SafeAreaView className="flex-1 bg-black">
        <View className="p-4 border-b border-secondary">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-secondary font-bold text-xl">Back</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="p-4 items-center justify-center">
              <Text className="text-white">No notifications yet</Text>
            </View>
          }
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Notifications;
