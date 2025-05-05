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
import SearchInput from '@/components/SearchInput';
import EmptyState from '@/components/EmptyState';
import { getUserAndPosts, getFilePreview } from '@/lib/appwrite';
import VideoCard from '@/components/VideoCard';
import { router } from 'expo-router';
import icons from '@/constants/icons';
import InfoBox from '@/components/InfoBox';

const UserProfile = () => {
  const { passedUserId, userId } = useLocalSearchParams<{ passedUserId?: string; userId?: string }>();
  const effectiveUserId = passedUserId || userId;

  useEffect(() => {
    console.log('Passed user id:', effectiveUserId);
  }, [effectiveUserId]);

  if (!effectiveUserId) {
    return (
      <SafeAreaView className="bg-primary h-full flex-1 justify-center items-center">
        <Text className="text-white">Error: No user specified.</Text>
      </SafeAreaView>
    );
  }

  const [data, setData] = useState<{ user: any; posts: any[] } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const result = await getUserAndPosts(effectiveUserId);
      setData(result);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching user and posts:", err);
      setError(err.message || "Error fetching user and posts");
    }
  };

  useEffect(() => {
    fetchData();
  }, [effectiveUserId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const generateInitials = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    const initials = nameParts.map((part) => part[0]).join('').toUpperCase();
    return initials.slice(0, 2); // Limit to 2 initials
  };

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

  if (!data) {
    return (
      <SafeAreaView className="bg-primary h-full flex-1 justify-center items-center">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }}/>
      <SafeAreaView className="bg-primary h-full">
      <View className="absolute top-20 left-4">
  <TouchableOpacity 
    onPress={() => router.back()} 
    className="bg-red-600 px-4 py-2 rounded-lg"
  >
    <Text className="text-white font-bold text-lg">Back</Text>
  </TouchableOpacity>
</View>
        <FlatList
          data={data.posts} // Always display posts
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => <VideoCard video={item} />}
          ListHeaderComponent={() => (
            <View className="w-full justify-center items-center mt-6 mb-12 px-4">
              {/* Back button header */}
              <TouchableOpacity
                className="w-full items-start mb-10"
                onPress={() => router.back()}
              >
                <Image
                  source={icons.back}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </TouchableOpacity>
              {/* Avatar above the name */}
              <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center bg-secondary">
                <Text className="text-white text-lg font-bold">
                  {generateInitials(data.user.username)}
                </Text>
              </View>
              {/* User's name */}
              <InfoBox
                title={data.user.username}
                containerStyles="mt-5"
                titleStyles="text-lg"
                subtitle={undefined}
              />
              {/* Posts and Followers */}
              <View className="flex-row mt-5">
                <InfoBox
                  title={data.posts.length || 0}
                  subtitle="Posts"
                  containerStyles="mr-10"
                  titleStyles="text-xl"
                />
                <InfoBox
                  title="1.2k"
                  subtitle="Followers"
                  titleStyles="text-xl"
                  containerStyles={undefined}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <EmptyState
              title="No Videos Found"
              subtitle="No videos found"
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default UserProfile;
