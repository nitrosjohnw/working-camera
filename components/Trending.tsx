// Import necessary components and libraries
import { View, FlatList, TouchableOpacity, ImageBackground, Image } from 'react-native'; // Core React Native components
import React, { useState, useEffect } from 'react'; // React library and hooks
import * as Animatable from 'react-native-animatable'; // Library for animations
import { Audio, Video, ResizeMode } from 'expo-av'; // Expo AV for audio and video playback
import icons from '@/constants/icons'; // Import app-specific icons

// Define animation styles for zooming in and out
const zoomIn = {
  0: { scale: 0.9 },
  1: { scale: 1 },
};

const zoomOut = {
  0: { scale: 1 },
  1: { scale: 0.9 },
};

// Component to render a single trending item
const TrendingItem = ({ activeItem, item }: { activeItem: any; item: any }) => {
  const [play, setPlay] = useState(false); // State to track whether the video is playing

  return (
    <Animatable.View
      animation={activeItem === item.$id ? zoomIn : zoomOut} // Apply zoom animation based on active item
      duration={500} // Animation duration
      style={{
        marginRight: 20,
        width: 208,
        height: 320,
        overflow: 'visible',
      }}
    >
      {play ? (
        // Render the video if it is playing
        <Video
          source={{ uri: item.video }} // Video source URL
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 15,
            backgroundColor: 'white',
          }}
          resizeMode={ResizeMode.CONTAIN} // Resize mode for the video
          useNativeControls // Show native video controls
          shouldPlay // Start playing the video
          isMuted={false} // Ensure audio is unmuted
          onPlaybackStatusUpdate={(status) => {
            // Handle video playback status updates
            if (
              status.isLoaded &&
              status.positionMillis !== undefined &&
              status.durationMillis !== undefined &&
              status.positionMillis >= status.durationMillis
            ) {
              setPlay(false); // Stop playing when the video finishes
            }
          }}
        />
      ) : (
        // Render the thumbnail if the video is not playing
        <TouchableOpacity
          activeOpacity={0.7} // Set opacity when pressed
          onPress={() => setPlay(true)} // Start playing the video on press
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 15,
            backgroundColor: '#1f2937', // Background color for the thumbnail
            overflow: 'hidden',
          }}
        >
          <ImageBackground
            source={{ uri: item.thumbnail }} // Thumbnail image source
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 15,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOpacity: 0.4,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 5,
            }}
            resizeMode="cover" // Resize mode for the thumbnail
          >
            {/* Play button icon */}
            <Image
              source={icons.play} // Play button icon source
              style={{
                width: 48,
                height: 48,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [{ translateX: -24 }, { translateY: -24 }], // Center the icon
              }}
              resizeMode="contain" // Ensure the icon fits within its container
            />
          </ImageBackground>
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

// Component to render the trending section
const Trending = ({ posts }: { posts: any }) => {
  const [activeItem, setActiveItem] = useState(posts[0]?.$id || null); // State to track the currently active item

  // Configure audio settings when the component mounts
  useEffect(() => {
    const configureAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, // Disable recording on iOS
        staysActiveInBackground: false, // Disable background playback
        playsInSilentModeIOS: true, // Allow playback in silent mode on iOS
        shouldDuckAndroid: true, // Lower other audio when playing on Android
        playThroughEarpieceAndroid: false, // Disable playback through the earpiece on Android
      });
    };

    configureAudio();
  }, []);

  // Handle changes in visible items
  const viewableItemsChanged = ({ viewableItems }: { viewableItems: any }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0]?.item.$id || null); // Update the active item based on the first visible item
    }
  };

  // Configuration for viewability
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 70, // Percentage of the item that must be visible to consider it "viewable"
  };

  return (
    <FlatList
      data={posts} // Data for the list of trending posts
      keyExtractor={(item, index) => (item?.$id ? item.$id.toString() : `post-${index}`)} // Unique key for each item
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} /> // Render each trending item
      )}
      onViewableItemsChanged={viewableItemsChanged} // Handle changes in visible items
      viewabilityConfig={viewabilityConfig} // Viewability configuration
      horizontal // Render the list horizontally
      contentContainerStyle={{ paddingHorizontal: 10 }} // Add horizontal padding
      showsHorizontalScrollIndicator={false} // Hide the horizontal scroll indicator
      initialScrollIndex={0} // Start at the first item
    />
  );
};

// Export the Trending component for use in other parts of the app
export default Trending;