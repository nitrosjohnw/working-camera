// Import necessary components and libraries
import { View, Text, Image } from 'react-native'; // React Native components
import React from 'react'; // React library
import { Tabs } from 'expo-router'; // Tabs navigation from Expo Router
import icons from '@/constants/icons'; // Import app icons

// Define the TabIcon component to render icons and labels for each tab
const TabIcon = ({ icon, color, name, focused }: { focused: boolean; icon: any; color: any; name: string }) => {
  return (
    <View className="items-center justify-center gap-2">
      {/* Tab Icon */}
      <Image
        source={icon} // Icon source
        resizeMode="contain" // Ensure the image fits within its container
        tintColor={color} // Set the icon color dynamically based on the tab's state
        className="w-6 h-6" // Icon size
      />
      {/* Tab Label */}
      <Text
        className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs w-12 items-center justify-center`} // Dynamic font style based on focus state
        style={{ color: color }} // Set the text color dynamically
      >
        {name} {/* Tab name */}
      </Text>
    </View>
  );
};

// Define the TabsLayout component to manage the tab navigation
const TabsLayout = () => {
  return (
    <>
      {/* Tabs Navigator */}
      <Tabs
        screenOptions={{
          tabBarShowLabel: false, // Hide default tab labels
          tabBarActiveTintColor: '#e22020', // Active tab color
          tabBarInactiveTintColor: '#ffffff', // Inactive tab color
          tabBarStyle: {
            backgroundColor: '#040404', // Tab bar background color
            borderTopWidth: 1, // Border width for the top of the tab bar
            borderTopColor: '#040404', // Border color for the top of the tab bar
            height: 84, // Height of the tab bar
          },
        }}
      >
        {/* Home Tab */}
        <Tabs.Screen
          name="home" // Route name for the home screen
          options={{
            title: 'Home', // Title for the screen
            headerShown: false, // Hide the header for this screen
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home} // Icon for the home tab
                focused={focused} // Whether the tab is focused
                color={color} // Color for the icon and label
                name={'  Home'} // Tab label
              />
            ),
          }}
        />

        {/* Record Tab */}
        <Tabs.Screen
          name="record" // Route name for the record screen
          options={{
            title: 'Record', // Title for the screen
            headerShown: false, // Hide the header for this screen
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.film} // Icon for the record tab
                focused={focused} // Whether the tab is focused
                color={color} // Color for the icon and label
                name={'Record'} // Tab label
              />
            ),
          }}
        />

        {/* Social Tab */}
        <Tabs.Screen
          name="social" // Route name for the social screen
          options={{
            title: 'Social', // Title for the screen
            headerShown: false, // Hide the header for this screen
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.social} // Icon for the social tab
                focused={focused} // Whether the tab is focused
                color={color} // Color for the icon and label
                name={'  Social'} // Tab label
              />
            ),
          }}
        />

        {/* Upload Tab */}
        <Tabs.Screen
          name="upload" // Route name for the upload screen
          options={{
            title: 'Upload', // Title for the screen
            headerShown: false, // Hide the header for this screen
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.upload} // Icon for the upload tab
                focused={focused} // Whether the tab is focused
                color={color} // Color for the icon and label
                name={' Upload'} // Tab label
              />
            ),
          }}
        />

        {/* Profile Tab */}
        <Tabs.Screen
          name="profile" // Route name for the profile screen
          options={{
            title: 'Profile', // Title for the screen
            headerShown: false, // Hide the header for this screen
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.profile} // Icon for the profile tab
                focused={focused} // Whether the tab is focused
                color={color} // Color for the icon and label
                name={'  Profile'} // Tab label
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

// Export the TabsLayout component for use in the app
export default TabsLayout;