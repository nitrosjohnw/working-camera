import { View, Text, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from '@/constants/icons';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { Link, router } from 'expo-router';
import { createUser } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';

const SignUp = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false); // <-- Added state for Terms

  const submit = async () => {
    if (!form.username || !form.email || !form.password) {
      return Alert.alert('Error', 'Please fill in all fields');
    }

    if (!acceptedTerms) {
      return Alert.alert('Error', 'Please accept the Terms of Service');
    }

    setIsSubmitting(true);
    try {
      const result = await createUser(form.email, form.password, form.username);
      setUser(result);
      setIsLoggedIn(true);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          <Image
            source={icons.logo}
            className="w-[130px] h-[84px]"
            resizeMode="contain"
          />
          <Text className="text-3xl text-white font-semibold mt-10">
            Sign Up to FlipClipz
          </Text>

          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e: string) => setForm({ ...form, username: e })}
            otherStyles="mt-10"
            placeholder="Enter your username"
          />
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e: string) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            placeholder="Enter your email"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e: string) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            placeholder="Enter your password"
          />

          {/* Terms of Service Acknowledgement */}
          <TouchableOpacity
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            className="flex-row items-center mt-5"
          >
            <View
              className={`w-5 h-5 mr-2 border-2 border-white ${
                acceptedTerms ? 'bg-white' : ''
              }`}
            />
            <Text className="text-white text-sm">
              I accept the{' '}
              <Link href="/terms" className="text-secondary underline">
                Terms of Service
              </Link>
            </Text>
          </TouchableOpacity>

          <CustomButton
            title="Sign Up"
            handlePress={submit}
            containerStyles="mt-7"
            textStyles={undefined}
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-white text-lg">Already have an account?</Text>
            <Link href="/(auth)/sign-in" className="text-lg font-semibold text-secondary">
              Sign In
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;