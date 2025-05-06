// Import necessary components and libraries
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '@/components/FormField';
import React, { useState, useEffect } from 'react';
import { Video, ResizeMode } from 'expo-av';
import icons from '@/constants/icons';
import CustomButton from '@/components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { createVideo } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';

// Define the list of sports options for the dropdown
const sportsOptions = [
  { label: 'Skateboarding', value: 'Skateboarding' },
  { label: 'BMX', value: 'BMX' },
  { label: 'Climbing', value: 'Climbing' },
  { label: 'Surfing', value: 'Surfing' },
  { label: 'Snowboarding', value: 'Snowboarding' },
  { label: 'Skiing', value: 'Skiing' },
  { label: 'Other', value: 'Other' },
  { label: 'Scootering', value: 'Scootering' },
];

const Upload = () => {
  // Access the global user context
  const { user } = useGlobalContext();

  // State to track the uploading process
  const [uploading, setUploading] = useState(false);

  // State to manage the form data
  const [form, setForm] = useState({
    title: '', // Title of the video
    video: null, // Video file
    thumbnail: null, // Thumbnail image
    sport: '', // Selected sport category
  });

  // State to control the visibility of the sport selection modal
  const [showSportModal, setShowSportModal] = useState(false);

  // Request media library permissions when the component mounts
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'You need to grant permission to access the gallery.');
      }
    })();
  }, []);

  // Function to open the media picker for selecting an image or video
  const openPicker = async (selectType: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          selectType === 'image'
            ? ImagePicker.MediaTypeOptions.Images // Allow only images
            : ImagePicker.MediaTypeOptions.Videos, // Allow only videos
        allowsEditing: true, // Enable editing
        quality: 1, // Set the quality to maximum
      });

      console.log('Picker result:', result);

      // Update the form state with the selected file
      if (!result.canceled && result.assets.length > 0) {
        if (selectType === 'image') {
          setForm((prevForm) => ({ ...prevForm, thumbnail: result.assets[0] }));
        } else if (selectType === 'video') {
          setForm((prevForm) => ({ ...prevForm, video: result.assets[0] }));
        }
      }
    } catch (error) {
      console.error('Picker Error:', error);
    }
  };

  // Function to remove the selected video
  const removeVideo = () => {
    setForm((prevForm) => ({ ...prevForm, video: null }));
  };

  // Function to remove the selected thumbnail image
  const removeImage = () => {
    setForm((prevForm) => ({ ...prevForm, thumbnail: null }));
  };

  // Function to handle form submission
  const submit = async () => {
    // Validate that all required fields are filled
    if (!form.title || !form.video || !form.thumbnail || !form.sport) {
      return Alert.alert('Please fill in all the fields');
    }

    setUploading(true); // Set uploading state to true

    try {
      // Call the API to create a new video post
      await createVideo({ ...form, userId: user.$id });
      Alert.alert('Success', 'Post Uploaded successfully');
      router.push('/(tabs)/home'); // Navigate to the home screen
    } catch (error: any) {
      Alert.alert('Error', error.message); // Show an error message
    } finally {
      // Reset the form and uploading state
      setForm({
        title: '',
        video: null,
        thumbnail: null,
        sport: '',
      });
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      {/* Show a loading spinner when uploading */}
      {uploading && (
        <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center z-50">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white mt-4">Uploading...</Text>
        </View>
      )}

      <ScrollView className="px-4 mt-6" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl text-white font-psemibold">Upload Video</Text>

        {/* Video Title Input */}
        <FormField
          otherStyles="mt-10"
          title="Video Title"
          value={form.title}
          placeholder="Give your clip a catchy title..."
          handleChangeText={(e: any) => setForm({ ...form, title: e })}
        />

        {/* Video Picker */}
        <View className="mt-7 space-y-2">
          <Text className="text-base text-white font-pmedium">Upload Video</Text>
          <TouchableOpacity onPress={() => openPicker('video')} disabled={!!form.video}>
            {form.video?.uri ? (
              <>
                {/* Display the selected video */}
                <Video
                  source={{ uri: form.video.uri }}
                  style={{ width: '100%', height: 500, borderRadius: 20 }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  shouldPlay
                  onError={(e) => console.log('Video Error:', e)}
                />
                <CustomButton
                  title="Remove Video"
                  handlePress={removeVideo}
                  containerStyles="mt-3 bg-red-500"
                  textStyles="text-base text-white font-pmedium"
                />
              </>
            ) : (
              // Placeholder for video picker
              <View className="w-full h-40 bg-white rounded-2xl justify-center items-center border-2 border-red-500">
                <View className="w-14 h-14 border border-dashed border-secondary justify-center items-center">
                  <Image source={icons.upload} resizeMode="contain" className="w-1/2 h-1/2" />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Thumbnail Picker */}
        <View className="mt-7 space-y-2">
          <Text className="text-base text-white font-pmedium">Thumbnail Image</Text>
          <TouchableOpacity onPress={() => openPicker('image')} disabled={!!form.thumbnail}>
            {form.thumbnail?.uri ? (
              <>
                {/* Display the selected thumbnail */}
                <Image
                  source={{ uri: form.thumbnail.uri }}
                  resizeMode="cover"
                  style={{ width: '100%', height: 200, borderRadius: 20 }}
                />
                <CustomButton
                  title="Remove Thumbnail"
                  handlePress={removeImage}
                  containerStyles="mt-3 bg-red-500"
                  textStyles="text-base text-white font-pmedium"
                />
              </>
            ) : (
              // Placeholder for thumbnail picker
              <View className="w-full h-16 bg-white rounded-2xl justify-center items-center border-2 border-red-500 flex-row space-x-2">
                <Image source={icons.upload} resizeMode="contain" className="w-5 h-5" />
                <Text className="text-sm text-secondary font-pmedium px-4">
                  Upload Thumbnail Image
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Sport Dropdown */}
        <View className="mt-7">
          <Text className="text-base text-white font-pmedium">Select Sport</Text>
          <TouchableOpacity
            onPress={() => setShowSportModal(true)}
            className="bg-white rounded-2xl border-2 border-red-500 p-3"
          >
            <Text className="text-secondary">
              {form.sport
                ? sportsOptions.find((option) => option.value === form.sport)?.label
                : 'Select a sport...'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <CustomButton
          title="Post Clip"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>

      {/* Sport Selection Modal */}
      <Modal
        visible={showSportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSportModal(false)}
      >
        <Pressable
          onPressOut={() => setShowSportModal(false)}
          className="flex-1 bg-black bg-opacity-50 justify-center items-center"
        >
          <View className="bg-white m-5 rounded-lg p-5 w-full">
            {sportsOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setForm({ ...form, sport: option.value });
                  setShowSportModal(false);
                }}
                className="py-2"
              >
                <Text className="text-base text-secondary">{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Upload;