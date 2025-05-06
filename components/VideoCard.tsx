// Import necessary components and libraries
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

// Define the VideoCard component
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
  const { user } = useGlobalContext(); // Access the current user from the global context
  const [play, setPlay] = useState(false); // State to track video playback
  const [liked, setLiked] = useState(() =>
    user && likedBy ? likedBy.includes(user.$id) : false
  ); // State to track if the video is liked by the user
  const [currentLikes, setCurrentLikes] = useState(likedBy ? likedBy.length : 0); // State to track the number of likes
  const [showComments, setShowComments] = useState(false); // State to toggle the comments section
  const [showMenu, setShowMenu] = useState(false); // State to toggle the dropdown menu
  const [deleted, setDeleted] = useState(false); // State to track if the video is deleted

  // Determine the avatar to display (creator's avatar or a default icon)
  const displayAvatar =
    creator?.avatar && creator.avatar.length > 0 ? creator.avatar : icons.defaultAvatar;
  const displayUsername = creator?.username || 'Deleted User'; // Fallback to "Deleted User" if no username is provided

  // Handle liking a video
  const handleLike = async () => {
    if (liked) return; // Prevent multiple likes
    try {
      await likeVideo($id, user.$id); // Call API to like the video
      setLiked(true); // Update liked state
      setCurrentLikes((prev) => prev + 1); // Increment the like count
    } catch (error) {
      console.error('Error liking video:', error); // Log any errors
    }
  };

  // Handle deleting a video
  const handleDelete = async () => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?', // Confirmation message
      [
        { text: 'Cancel', onPress: () => setShowMenu(false), style: 'cancel' }, // Cancel button
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteVideo($id); // Call API to delete the video
              Alert.alert('Success', 'Video deleted successfully'); // Show success message
              setDeleted(true); // Mark the video as deleted
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Could not delete video'); // Show error message
            } finally {
              setShowMenu(false); // Close the menu
            }
          },
          style: 'destructive', // Destructive button style
        },
      ]
    );
  };

  // Define the user ID to pass along in navigation
  const passedUserId = creator?.accountId ? creator.accountId : creator?.username;

  // Check if the current user is the owner of the video
  const isOwner = creator?.username === user?.username;

  // Return null if the video is deleted
  if (deleted) return null;

  return (
    <View className="flex-col items-center px-4 mb-14">
      {/* Top Info Row */}
      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          {/* Avatar Container */}
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            <Image 
              source={{ uri: displayAvatar }} // Display the avatar
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>
          {/* Video Title and Creator */}
          <View className="justify-center flex-1 ml-3">
            <Text className="text-white font-psemibold text-sm" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-xl text-white font-pregular" numberOfLines={1}>
              {displayUsername}
            </Text>
          </View>
          {/* Sport Category */}
          <Text className="text-white font-psemibold text-sm" numberOfLines={1}>
            {sport}
          </Text>
        </View>
        {/* Menu Button */}
        <TouchableOpacity onPress={() => setShowMenu(true)} className="pt-3">
          <Image source={icons.menu} className="w-7 h-7" resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Video or Thumbnail */}
      {play ? (
        <Video
          source={{ uri: video }} // Video source
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
              setPlay(false); // Stop playing when the video ends
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)} // Start playing the video
          className="w-full h-80 relative"
        >
          <Image
            source={{ uri: thumbnail }} // Thumbnail source
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
        {/* Like Button */}
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={handleLike} 
            activeOpacity={0.7}
            disabled={liked} // Disable if already liked
          >
            <Image
              source={icons.like}
              style={{
                width: 24,
                height: 24,
                tintColor: liked ? 'red' : 'white', // Change color if liked
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {currentLikes > 0 && (
            <Text className="ml-1 text-white text-xs">{currentLikes}</Text> // Display like count
          )}
        </View>
        {/* Comments Button */}
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
            {/* Delete Video Option (only for owner) */}
            {isOwner && (
              <TouchableOpacity 
                onPress={handleDelete}
                className="py-2 border-b border-gray-300"
              >
                <Text className="text-center text-red-600 font-bold">Delete Video</Text>
              </TouchableOpacity>
            )}
            {/* View Profile Option */}
            <TouchableOpacity 
              onPress={() => {
                router.push(`/userProfile?userId=${passedUserId}`); // Navigate to user profile
                setShowMenu(false);
              }}
              className="py-2 border-b border-gray-300">
              <Text className="text-center text-blue-600 font-bold">View Profile</Text>
            </TouchableOpacity>
            {/* Cancel Option */}
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