import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  Pressable 
} from 'react-native';
import React, { useState } from 'react';
import { Video, ResizeMode } from 'expo-av';
import icons from '@/constants/icons';
import { likeVideo, deleteVideo } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';
import CommentsSection from '@/components/CommentsSection';
import { router } from 'expo-router';

function VideoCard({
  video: { $id, title, thumbnail, sport, video, likedBy, comments, creator },
}: {
  video: {
    $id: string;
    title: string;
    thumbnail: string;
    sport: string;
    video: string;
    likedBy: string[];
    comments: number;
    creator?: { accountId?: string; username?: string; avatar?: string };
  };
}) {
  const { user } = useGlobalContext();
  const [play, setPlay] = useState(false);
  const [liked, setLiked] = useState(() =>
    user && likedBy ? likedBy.includes(user.$id) : false
  );
  const [currentLikes, setCurrentLikes] = useState(likedBy ? likedBy.length : 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleted, setDeleted] = useState(false);

  // Use the creator's avatar if it exists; otherwise, use the default icon.
  const displayAvatar =
    creator?.avatar && creator.avatar.length > 0 ? creator.avatar : icons.defaultAvatar;
  const displayUsername = creator?.username || 'Deleted User';

  const handleLike = async () => {
    if (liked) return;
    try {
      await likeVideo($id, user.$id);
      setLiked(true);
      setCurrentLikes((prev) => prev + 1);
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        { text: 'Cancel', onPress: () => setShowMenu(false), style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteVideo($id);
              Alert.alert('Success', 'Video deleted successfully');
              setDeleted(true);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Could not delete video');
            } finally {
              setShowMenu(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Define passedUserId to pass along in navigation.
  const passedUserId = creator?.accountId ? creator.accountId : creator?.username;

  const isOwner = creator?.username === user?.username;
  if (deleted) return null;

  return (
    <View className="flex-col items-center px-4 mb-14">
      {/* Top Info Row */}
      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          {/* Static Avatar Container */}
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            <Image 
              source={{ uri: displayAvatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>
          <View className="justify-center flex-1 ml-3">
            <Text className="text-white font-psemibold text-sm" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-xl text-white font-pregular" numberOfLines={1}>
              {displayUsername}
            </Text>
          </View>
          <Text className="text-white font-psemibold text-sm" numberOfLines={1}>
            {sport}
          </Text>
        </View>
        {/* Always show menu button */}
        <TouchableOpacity onPress={() => setShowMenu(true)} className="pt-3">
          <Image source={icons.menu} className="w-7 h-7" resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Video or Thumbnail */}
      {play ? (
        <Video
          source={{ uri: video }}
          style={{ width: '100%', height: 320, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)' }}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (
              status.isLoaded &&
              status.positionMillis !== undefined &&
              status.durationMillis !== undefined &&
              status.positionMillis >= status.durationMillis
            ) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-80 relative"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3 bg-gray-800"
            resizeMode="cover"
          />
          <View className="absolute inset-0 justify-center items-center">
            <Image source={icons.play} className="w-12 h-12" resizeMode="contain" />
          </View>
        </TouchableOpacity>
      )}

      {/* Likes and Comments Section */}
      <View className="flex-row justify-between items-center mt-6 w-full">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={handleLike} 
            activeOpacity={0.7}
            disabled={liked}
          >
            <Image
              source={icons.like}
              style={{
                width: 24,
                height: 24,
                tintColor: liked ? 'red' : 'white',
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {currentLikes > 0 && (
            <Text className="ml-1 text-white text-xs">{currentLikes}</Text>
          )}
        </View>
        <TouchableOpacity 
          onPress={() => setShowComments((prev) => !prev)} 
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Image 
              source={icons.comment} 
              className="w-6 h-6" 
              resizeMode="contain" 
            />
            <Text className="ml-1 text-white text-xs">{comments}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Inline Comments Section */}
      {showComments && <CommentsSection videoId={$id} />}

      {/* Dropdown Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable 
          onPressOut={() => setShowMenu(false)}
          className="flex-1 bg-black bg-opacity-50 justify-center items-center"
        >
          <View className="bg-white m-5 rounded-lg p-5 w-3/4">
            {isOwner && (
              <TouchableOpacity 
                onPress={handleDelete}
                className="py-2 border-b border-gray-300"
              >
                <Text className="text-center text-red-600 font-bold">Delete Video</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={() => {
                console.log("View Profile: passedUserId =", passedUserId);
                router.push(`/userProfile?userId=${passedUserId}`);
                setShowMenu(false);
              }}
              className="py-2 border-b border-gray-300"
            >
              <Text className="text-center text-blue-600 font-bold">View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowMenu(false)}
              className="py-2"
            >
              <Text className="text-center text-secondary">Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default VideoCard;
