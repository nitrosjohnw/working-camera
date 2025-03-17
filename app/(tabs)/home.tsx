import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  RefreshControl, 
  TouchableOpacity 
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from '@/constants/icons';
import SearchInput from '@/components/SearchInput';
import Trending from '@/components/Trending';
import EmptyState from '@/components/EmptyState';
import { getAllPosts, getLatestPosts } from '@/lib/appwrite';
import useAppwrite from '@/lib/useAppwrite';
import VideoCard from '@/components/VideoCard';
import { useGlobalContext } from '../../context/GlobalProvider';
import { router } from 'expo-router';

const Home = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(getAllPosts);
  const { data: latestPosts } = useAppwrite(getLatestPosts);

  const [refreshing, setRefreshing] = useState(false);
  // Dummy state for notification count; replace with real logic as needed.
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Replace this with your actual logic to fetch notifications count.
    setNotificationCount(3);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Sort videos by date uploaded (latest first)
  const sortedLatestPosts = useMemo(() => {
    return latestPosts && latestPosts.length > 0
      ? [...latestPosts].sort(
          (a, b) => Number(new Date(b.$createdAt)) - Number(new Date(a.$createdAt))
        )
      : [];
  }, [latestPosts]);

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item: { $id: string }) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="font-pmedium text-sm text-white">Welcome Back</Text>
                <Text className="text-2xl font-psemibold text-white">{user?.username}</Text>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => router.push('/notifications')}
                  className="relative mr-2"
                >
                  <Image
                    source={icons.notification}
                    className="w-6 h-8"
                    resizeMode="contain"
                    style={{ tintColor: "#FF0000" }}
                  />
                  {notificationCount > 0 && (
                    <View className="absolute top-0 right-0 bg-red-500 rounded-full w-5 h-5 justify-center items-center">
                      <Text className="text-white text-xs">{notificationCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <Image
                  source={icons.logo}
                  className="w-10 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>
            <SearchInput 
              otherStyles={undefined} 
              handleChangeText={undefined} 
              title={''} 
              value={undefined} 
              placeholder={''}
            />
            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-white text-lg font-pregular mb-3">
                Latest Videos
              </Text>
              <Trending posts={sortedLatestPosts} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No Videos Created Yet"
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
};

export default Home;
