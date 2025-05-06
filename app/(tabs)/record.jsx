import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Camera, useCameraPermission, useCameraDevice } from "react-native-vision-camera";
import * as MediaLibrary from "expo-media-library";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import SystemSetting from 'react-native-system-setting';
import * as FileSystem from "expo-file-system";

const MAX_ZOOM_FACTOR = 4;
const clipDurationOptions = [5, 15, 30, 60]; // durations in seconds

const Record = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  // videoUri is kept in state (and in a ref for immediate updates)
  const [videoUri, setVideoUri] = useState(null);
  const videoUriRef = useRef(null);

  // Flag to show the "Clip Last Xs" button after 5 seconds of recording.
  const [showClipButton, setShowClipButton] = useState(false);

  // Clip duration state (in seconds). Default is 5 seconds.
  const [clipDuration, setClipDuration] = useState(5);

  // Camera configuration
  const [cameraPosition, setCameraPosition] = useState("back");
  const [zoom, setZoom] = useState(1);
  const [flash, setFlash] = useState("off");

  const device = useCameraDevice(cameraPosition);

  // Volume state
  const [currentVolume, setCurrentVolume] = useState(0);

  useEffect(() => {
    (async () => {
      if (!hasPermission) await requestPermission();
      if (!mediaPermission?.granted) await requestMediaPermission();
    })();

    let lastVolume = 0;

    // Get the initial volume and adjust if necessary
    SystemSetting.getVolume().then((volume) => {
      let initialVolume = volume;
      if (initialVolume === 1) {
        initialVolume = 0;
        SystemSetting.setVolume(0); // Set the volume to 0 if it is initially 1
      }
      lastVolume = initialVolume;
      setCurrentVolume(initialVolume);
      console.log("Initial volume:", initialVolume);
    });

    const volumeListener = SystemSetting.addVolumeListener((data) => {
      console.log("Volume changed:", data.value);
      let newVolume = data.value;
      if (newVolume === 1) {
        newVolume = 0;
        SystemSetting.setVolume(0); // Reset volume to 0 if it is set to 1
      }
      setCurrentVolume(newVolume);
      lastVolume = newVolume;
    });

    const interval = setInterval(async () => {
      const volume = await SystemSetting.getVolume();
      if (volume !== lastVolume) {
        let newVolume = volume;
        if (newVolume === 1) {
          newVolume = 0;
          SystemSetting.setVolume(0); // Reset volume to 0 if it is set to 1
        }
        setCurrentVolume(newVolume);
        lastVolume = newVolume;
        if (isRecording && showClipButton) {
          await handleClipButtonPress();
        }
      }
    }, 500);

    return () => {
      SystemSetting.removeVolumeListener(volumeListener);
      clearInterval(interval);
    };
  }, [isRecording, showClipButton]);

  // When recording starts, show the clip button after 5 seconds.
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setTimeout(() => {
        setShowClipButton(true);
      }, 5000);
    } else {
      setShowClipButton(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRecording]);

  // Helper: Wait until videoUri is set by checking the ref.
  const waitForVideoUri = async (timeout = clipDuration * 1000) => {
    const startTime = Date.now();
    while (!videoUriRef.current && Date.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    return videoUriRef.current;
  };

  // Function to start recording.
  const startRecording = async () => {
    if (!cameraRef.current) return;
    setIsRecording(true);
    setShowClipButton(false);
    // Clear previous URI.
    setVideoUri(null);
    videoUriRef.current = null;
    try {
      await cameraRef.current.startRecording({
        fileType: "mp4",
        flash,
        onRecordingFinished: async (video) => {
          videoUriRef.current = video.path;
          setVideoUri(video.path);
          await MediaLibrary.saveToLibraryAsync("file://" + video.path);
          setIsRecording(false);
        },
        onRecordingError: () => {
          Alert.alert("Error", "Recording failed");
          setIsRecording(false);
        },
      });
    } catch (error) {
      Alert.alert("Error", "Recording failed");
      setIsRecording(false);
    }
  };

  // Function to stop recording.
  const stopRecording = async () => {
    if (!cameraRef.current) return;
    setIsRecording(false);
    setShowClipButton(false);
    await cameraRef.current.stopRecording();
  };

  // Function to clip the last {clipDuration} seconds from the recorded video using expo-file-system.
  const clipLastSeconds = async (sourceUri, duration) => {
    try {
      const outputFile = `${FileSystem.documentDirectory}clipped-video.mp4`;

      // Simulate trimming by copying the file
      await FileSystem.copyAsync({
        from: sourceUri,
        to: outputFile,
      });

      // Save the copied video to the media library
      await MediaLibrary.saveToLibraryAsync(outputFile);

    } catch (error) {
      Alert.alert("Error", error.message || "Clipping failed");
    }
  };

  const handleClipButtonPress = async () => {
    if (isRecording) {
      await stopRecording();
    }
    const finalUri = await waitForVideoUri();
    if (!finalUri) {
      Alert.alert("Error", "No video recorded");
      return;
    }
    await clipLastSeconds(finalUri, clipDuration);
    // Small delay to allow the camera to finalize before restarting.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await startRecording();
  };

  // New function to take a photo.
  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePhoto({ flash });
      await MediaLibrary.saveToLibraryAsync("file://" + photo.path);
    } catch (error) {
      Alert.alert("Error", "Photo capture failed");
    }
  };

  // Switch between front and back camera.
  const switchCamera = () => {
    setCameraPosition((prev) => {
      const newPosition = prev === "back" ? "front" : "back";
      // If switching to front, immediately deactivate flash.
      if (newPosition === "front") {
        setFlash("off");
      }
      return newPosition;
    });
  };

  const handleZoom = (zoomChange) => {
    setZoom((prev) => Math.max(1, Math.min(prev + zoomChange, MAX_ZOOM_FACTOR)));
  };

  // Deactivate flash for front-facing camera.
  const toggleFlash = () => {
    if (cameraPosition === "front") {
      setFlash("off");
      return;
    }
    setFlash((prev) =>
      prev === "off" ? "on" : prev === "on" ? "auto" : "off"
    );
  };

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission required</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.permissionButton}>Allow Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No camera device available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Camera
        style={{ flex: 1 }}
        ref={cameraRef}
        device={device}
        isActive={true}
        photo={true}
        video={true}
        audio={true}
        zoom={zoom}
      />

      <View className="absolute top-24 right-5 items-center">
        {cameraPosition === "back" && (
          <TouchableOpacity onPress={toggleFlash} className="p-2 bg-red-500/50 rounded-full mb-2">
            <Ionicons
              name={
                flash === "off" ? "flash-off" : flash === "on" ? "flash" : "flash-outline"
              }
              size={30}
              color="white"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => handleZoom(0.5)} className="p-2 bg-red-500/50 rounded-full mb-2">
          <Text className="text-white text-lg">+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleZoom(-0.5)} className="p-2 bg-red-500/50 rounded-full">
          <Text className="text-white text-lg">-</Text>
        </TouchableOpacity>
      </View>

      <View className="absolute top-24 left-5 flex-col items-start">
        {clipDurationOptions.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setClipDuration(option)}
            className={`py-2 px-3 rounded-full mb-2 ${
              clipDuration === option ? "bg-red-700" : "bg-red-500/50"
            }`}
          >
            <Text className="text-white text-base">
              {option === 60 ? "1m" : option + "s"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
            {/* Clip Button */}
    {isRecording && showClipButton && (
      <View className="absolute bottom-40 w-full flex-row justify-center items-center  left-0">
        <TouchableOpacity
          onPress={handleClipButtonPress}
          className="py-2 px-3 bg-red-500/50 rounded-full"
        >
          <Text className="text-white text-base">
            Clip Last {clipDuration}
            {clipDuration === 60 ? "m" : "s"}
          </Text>
        </TouchableOpacity>
      </View>
    )}
      <View className="absolute bottom-10 w-full flex-row justify-around items-center">
        <TouchableOpacity onPress={switchCamera} className="p-4">
          <AntDesign name="retweet" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          className="border-4 border-white rounded-full w-20 h-20 justify-center items-center"
        >
          <View className={`w-16 h-16 rounded-full ${isRecording ? "bg-red-500" : "bg-white"}`} />
        </TouchableOpacity>
        <TouchableOpacity onPress={takePhoto} className="p-4">
          <Feather name="camera" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Record;