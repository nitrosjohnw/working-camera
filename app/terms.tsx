import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';

const TermsOfService = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="bg-primary h-full">
    <Stack.Screen options={{ headerShown: false }}/>
      <ScrollView className="px-4 py-6">
        <Text className="text-3xl text-white font-semibold mb-4">
          Terms of Service
        </Text>

        <Text className="text-white mb-4">
          Welcome to FlipClipz! Please read these Terms of Service ("Terms") carefully before using our app. By accessing or using FlipClipz, you agree to be bound by these Terms.
        </Text>

        {/* Section 1: User Responsibilities */}
        <Text className="text-white font-semibold mb-2">1. User Responsibilities</Text>
        <Text className="text-white mb-4">
          - You are responsible for any content you upload, including videos, images, and comments.
          {"\n"}- Do not upload illegal, harmful, or copyrighted material without permission.
          {"\n"}- You must not harass, abuse, or harm other users.
        </Text>

        {/* Section 2: Content Ownership */}
        <Text className="text-white font-semibold mb-2">2. Content Ownership</Text>
        <Text className="text-white mb-4">
          - You retain ownership of your content. However, by uploading, you grant FlipClipz a non-exclusive license to display and share your content within the app.
        </Text>

        {/* Section 3: Data Privacy */}
        <Text className="text-white font-semibold mb-2">3. Data Privacy</Text>
        <Text className="text-white mb-4">
          - We respect your privacy and are committed to protecting your personal data.
          {"\n"}- All data is stored securely using Appwrite services.
          {"\n"}- For more information, see our Privacy Policy.
        </Text>

        {/* Section 4: Termination */}
        <Text className="text-white font-semibold mb-2">4. Termination</Text>
        <Text className="text-white mb-4">
          - We reserve the right to suspend or terminate accounts that violate these Terms.
          {"\n"}- Users can also delete their accounts at any time by contacting support.
        </Text>

        {/* Section 5: Changes to Terms */}
        <Text className="text-white font-semibold mb-2">5. Changes to Terms</Text>
        <Text className="text-white mb-4">
          - FlipClipz may update these Terms occasionally. You will be notified of significant changes.
        </Text>

        {/* Section 6: Contact */}
        <Text className="text-white font-semibold mb-2">6. Contact</Text>
        <Text className="text-white mb-8">
          - If you have any questions, please contact us at: support@flipclipz.com
        </Text>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-secondary py-3 px-5 rounded-lg items-center"
        >
          <Text className="text-white text-lg font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};