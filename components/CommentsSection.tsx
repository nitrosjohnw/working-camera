// Import necessary components and libraries
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider'; // Access global user context
import { getCommentsForVideo, addComment, deleteComment } from '@/lib/appwrite'; // API functions for comments

const CommentsSection = ({ videoId }: { videoId: string }) => {
  const { user } = useGlobalContext(); // Get the current user from the global context
  const [comments, setComments] = useState<any[]>([]); // State to store the list of comments
  const [loading, setLoading] = useState(false); // State to track loading status
  const [commentText, setCommentText] = useState(''); // State to store the text of the new comment

  // Fetch comments for the given video
  const fetchComments = async () => {
    setLoading(true); // Set loading state to true
    try {
      const data = await getCommentsForVideo(videoId); // Fetch comments from the server
      setComments(data); // Update the comments state
    } catch (error) {
      console.error('Error fetching comments:', error); // Log the error
      Alert.alert('Error', error.message || 'Error fetching comments'); // Show an error alert
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Fetch comments whenever the video ID changes
  useEffect(() => {
    fetchComments();
  }, [videoId]);

  // Handle posting a new comment
  const handlePostComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Empty Comment', 'Please enter a comment.'); // Alert if the comment is empty
      return;
    }
    if (!user) {
      Alert.alert('Not Logged In', 'You must be logged in to comment.'); // Alert if the user is not logged in
      return;
    }
    try {
      const newComment = await addComment(videoId, user.$id, user.username, commentText); // Add the comment
      setComments((prev) => [newComment, ...prev]); // Add the new comment to the list
      setCommentText(''); // Clear the input field
    } catch (error) {
      console.error('Error posting comment:', error); // Log the error
      Alert.alert('Error', error.message || 'Error posting comment'); // Show an error alert
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete your comment?', // Confirmation message
      [
        {
          text: 'Cancel',
          style: 'cancel', // Cancel button
        },
        {
          text: 'Delete',
          style: 'destructive', // Delete button
          onPress: async () => {
            try {
              await deleteComment(commentId); // Delete the comment
              setComments((prev) => prev.filter((comment) => comment.$id !== commentId)); // Remove the comment from the list
            } catch (error) {
              console.error('Error deleting comment:', error); // Log the error
              Alert.alert('Error', error.message || 'Error deleting comment'); // Show an error alert
            }
          },
        },
      ],
      { cancelable: true } // Allow the alert to be dismissed
    );
  };

  // Render a single comment item
  const renderCommentItem = ({ item }: { item: any }) => (
    <View className="py-3 border-b border-secondary flex-row items-center w-full">
      <View className="flex-1">
        {/* Display the username */}
        <Text className="text-base font-semibold text-white">
          {item.username || 'Anonymous'}:
        </Text>
        {/* Display the comment text */}
        <Text className="text-sm text-gray-300 mt-1">{item.comment}</Text>
      </View>
      {/* Show delete button if the comment belongs to the current user */}
      {user && item.userId === user.$id && (
        <TouchableOpacity onPress={() => handleDeleteComment(item.$id)} className="ml-2">
          <Text className="text-red-500 font-bold text-xl">×</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-primary w-full">
      {/* List of comments */}
      <FlatList
        data={comments} // Data for the list
        keyExtractor={(item) => item.$id} // Unique key for each comment
        renderItem={renderCommentItem} // Render each comment
        ListEmptyComponent={
          <Text className="text-center text-gray-400 my-4">No comments yet.</Text> // Message when no comments are available
        }
        refreshing={loading} // Show loading indicator during refresh
        onRefresh={fetchComments} // Refresh comments on pull-to-refresh
        className="w-full"
      />
      {/* Input field and post button */}
      <View className="flex-row items-center p-4 border-t border-secondary w-full">
        <TextInput
          className="flex-1 border border-secondary rounded-lg p-2 text-white" // Input field styling
          placeholder="Write a comment..." // Placeholder text
          placeholderTextColor="gray" // Placeholder text color
          value={commentText} // Bind input value to state
          onChangeText={setCommentText} // Update state on text change
        />
        <TouchableOpacity onPress={handlePostComment} className="ml-4 bg-secondary p-2 rounded-lg">
          <Text className="text-white font-semibold">Post</Text> {/* Post button */}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommentsSection; // Export the CommentsSection component