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
import { FFmpegKit } from "ffmpeg-kit-react-native";
import SystemSetting from 'react-native-system-setting';

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

    // Add volume button listener
    let lastVolume = 0;
    SystemSetting.getVolume().then((volume) => {
      lastVolume = volume;
      setCurrentVolume(volume);
      console.log("Initial volume:", volume);
    });

    const volumeListener = SystemSetting.addVolumeListener((data) => {
      console.log("Volume changed:", data.value);
      let newVolume = data.value;
      if (newVolume === 1) {
        newVolume = 0;
        SystemSetting.setVolume(0);
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
          SystemSetting.setVolume(0);
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

  // Function to clip the last {clipDuration} seconds from the recorded video using FFmpeg.
  const clipLastSeconds = async (sourceUri, duration) => {
    const outputFile = sourceUri.replace(".mp4", `-clip${Date.now()}.mp4`);
    const ffmpegCommand = `-sseof -${duration} -i "${sourceUri}" -t ${duration} -c copy "${outputFile}"`;
    try {
      await FFmpegKit.executeAsync(ffmpegCommand, async (session) => {
        const returnCode = await session.getReturnCode();
        if (returnCode.isValueSuccess()) {
          await MediaLibrary.saveToLibraryAsync("file://" + outputFile);
        } else {
          Alert.alert("Error", "Clipping failed");
        }
      });
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
    <SafeAreaView style={styles.container}>
      {/* Camera view */}
      <Camera
        style={styles.camera}
        ref={cameraRef}
        device={device}
        isActive={true}
        photo={true}
        video={true}
        audio={true}
        zoom={zoom}
      />

      {/* Flash & Zoom Controls - Positioned at the top right */}
      <View style={styles.flashZoomContainer}>
        {cameraPosition === "back" && (
          <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
            <Ionicons
              name={
                flash === "off" ? "flash-off" : flash === "on" ? "flash" : "flash-outline"
              }
              size={30}
              color="white"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => handleZoom(0.5)} style={styles.zoomButton}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleZoom(-0.5)} style={styles.zoomButton}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>

      {/* Clip Duration Selector - Positioned on the left side under flash/zoom controls */}
      <View style={styles.clipDurationContainer}>
        {clipDurationOptions.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setClipDuration(option)}
            style={[
              styles.durationButton,
              clipDuration === option && styles.durationButtonSelected,
            ]}
          >
            <Text style={styles.durationButtonText}>
              {option === 60 ? "1m" : option + "s"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Control Buttons */}
      <View style={styles.controlsContainer}>
        {/* "Clip Last Xs" Button: Appears after 5 seconds of recording */}
        {isRecording && showClipButton && (
          <TouchableOpacity onPress={handleClipButtonPress} style={styles.clipButton}>
            <Text style={styles.clipButtonText}>
              Clip Last {clipDuration}
              {clipDuration === 60 ? "m" : "s"}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={switchCamera} style={styles.modeButton}>
          <AntDesign name="retweet" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          style={styles.shutterButton}
        >
          <View style={[styles.shutterInner, isRecording && styles.recordingShutter]} />
        </TouchableOpacity>
        {/* Photo capture button */}
        <TouchableOpacity onPress={takePhoto} style={styles.modeButton}>
          <Feather name="camera" size={28} color="white" />
        </TouchableOpacity>
      </View>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    color: "white",
    fontSize: 16,
  },
  permissionButton: {
    color: "blue",
    fontSize: 16,
    marginTop: 10,
  },
  flashZoomContainer: {
    position: "absolute",
    top: 100,
    right: 20,
    alignItems: "center",
  },
  flashButton: {
    padding: 10,
    backgroundColor: "rgba(244, 62, 62, 0.5)",
    borderRadius: 30,
    marginBottom: 10,
  },
  zoomButton: {
    padding: 10,
    backgroundColor: "rgba(248, 54, 54, 0.5)",
    borderRadius: 30,
    marginBottom: 10,
  },
  zoomText: {
    fontSize: 20,
    color: "white",
  },
  clipDurationContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  durationButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(236,66,66,0.5)",
    borderRadius: 30,
    marginBottom: 10,
  },
  durationButtonSelected: {
    backgroundColor: "rgb(255, 5, 5)", // darker when selected
  },
  durationButtonText: {
    fontSize: 16,
    color: "white",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  modeButton: {
    padding: 15,
  },
  shutterButton: {
    borderWidth: 4,
    borderColor: "white",
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
  },
  recordingShutter: {
    backgroundColor: "red",
  },
  clipButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(236,66,66,0.5)",
    borderRadius: 30,
    marginBottom: 10,
    position: "absolute",
    bottom: 120,
    left: 20,
  },
  clipButtonText: {
    fontSize: 16,
    color: "white",
  },
  volumeContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -150 }, { translateY: -12 }],
  },
  counterText: {
    color: "white",
    fontSize: 24,
    marginBottom: 20,
  },
});

export default Record;