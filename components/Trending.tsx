import { View, FlatList, TouchableOpacity, ImageBackground, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { Audio, Video, ResizeMode } from 'expo-av';
import icons from '@/constants/icons';

const zoomIn = {
  0: { scale: 0.9 },
  1: { scale: 1 },
};

const zoomOut = {
  0: { scale: 1 },
  1: { scale: 0.9 },
};

const TrendingItem = ({ activeItem, item }: { activeItem: any; item: any }) => {
  const [play, setPlay] = useState(false);

  return (
    <Animatable.View
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
      style={{
        marginRight: 20,
        width: 208,
        height: 320,
        overflow: 'visible',
      }}
    >
      {play ? (
        <Video
          source={{ uri: item.video }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 15,
            backgroundColor: 'white',
          }}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          isMuted={false} // Ensures audio is unmuted
          onPlaybackStatusUpdate={(status) => {
            if (
              status.isLoaded &&
              status.positionMillis !== undefined &&
              status.durationMillis !== undefined &&
              status.positionMillis >= status.durationMillis
            ) {
              setPlay(false); // Video finished playing
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 15,
            backgroundColor: '#1f2937', 
            overflow: 'hidden',
          }}
        >
          <ImageBackground
            source={{ uri: item.thumbnail }}
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
            resizeMode="cover"
          >
            <Image
              source={icons.play}
              style={{
                width: 48,
                height: 48,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [{ translateX: -24 }, { translateY: -24 }],
              }}
              resizeMode="contain"
            />
          </ImageBackground>
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

const Trending = ({ posts }: { posts: any }) => {
  const [activeItem, setActiveItem] = useState(posts[0]?.$id || null);

  useEffect(() => {
    const configureAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    };

    configureAudio();
  }, []);

  const viewableItemsChanged = ({ viewableItems }: { viewableItems: any }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0]?.item.$id || null); // Update active item based on visible item
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 70,
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={(item, index) => (item?.$id ? item.$id.toString() : `post-${index}`)}

      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      horizontal
      contentContainerStyle={{ paddingHorizontal: 10 }}
      showsHorizontalScrollIndicator={false}
      initialScrollIndex={0}
    />
  );
};

export default Trending;
