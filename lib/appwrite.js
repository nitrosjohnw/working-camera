import { Client, Account, ID, Avatars, Databases, Query, Storage } from 'react-native-appwrite'; // Appwrite SDK modules

// Appwrite configuration object
export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1', // Appwrite API endpoint
    platfrom: 'com.jmw.FlipClipz', // Platform identifier
    projectId: '678fd361000a7106eeb3', // Appwrite project ID
    databaseId: '678fe3e60003cd09d88a', // Database ID
    userCollectionId: '678fe41e0032bd766258', // User collection ID
    videoCollectionId: '678fe472002256f323b8', // Video collection ID
    commentCollectionId: '67b67293000da0f6e3ba', // Comment collection ID
    storageId: '678fe5e300320a334ea6', // Storage bucket ID
};

// Destructure configuration for easier access
const {
    endpoint,
    platfrom,
    projectId,
    databaseId,
    userCollectionId,
    videoCollectionId,
    commentCollectionId,
    storageId,
} = appwriteConfig;

// Initialize Appwrite client
const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint) // Set API endpoint
    .setProject(appwriteConfig.projectId) // Set project ID
    .setPlatform(appwriteConfig.platfrom); // Set platform identifier

// Initialize Appwrite services
const account = new Account(client); // Account service for authentication
const avatars = new Avatars(client); // Avatars service for user avatars
const databases = new Databases(client); // Databases service for CRUD operations
const storage = new Storage(client); // Storage service for file uploads

// Function to create a new user
export const createUser = async (email, password, username) => {
    try {
        // Create a new account
        const newAccount = await account.create(
            ID.unique(), // Generate a unique ID
            email, // User email
            password, // User password
            username // User username
        );
        if (!newAccount) throw Error; // Throw an error if account creation fails

        // Generate an avatar URL based on the username
        const avatarUrl = avatars.getInitials(username);

        // Automatically sign in the user after account creation
        await signIn(email, password);

        // Create a user document in the database
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId, // Database ID
            appwriteConfig.userCollectionId, // User collection ID
            ID.unique(), // Generate a unique document ID
            {
                accountId: newAccount.$id, // Link the account ID
                email, // User email
                username, // User username
                avatar: avatarUrl, // User avatar
            }
        );
        return newUser; // Return the created user document
    } catch (error) {
        console.log(error); // Log the error
        throw new Error(error); // Throw the error for further handling
    }
};
// Function to sign in a user
export async function signIn(email, password) {
    try {
        // Create a session using email and password
        const session = await account.createEmailPasswordSession(email, password); 
        return session; // Return the session object
    } catch (error) {
        console.error("Sign-in Error:", error); // Log the error
        throw new Error(error.message || "Failed to sign in"); // Throw an error with a message
    }
}

// Function to get the current logged-in user
export const getCurrentUser = async () => {
    try {
        // Get the current account
        const currentAccount = await account.get();
        if (!currentAccount) throw new Error('No account found'); // Throw an error if no account is found

        // Fetch the user document from the database
        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)] // Query by account ID
        );

        if (!currentUser.documents || currentUser.documents.length === 0) {
            throw new Error('No matching user found'); // Throw an error if no matching user is found
        }

        return currentUser.documents[0]; // Return the first matching user document
    } catch (error) {
        console.error(error); // Log the error
        throw new Error(error.message || 'Error fetching current user'); // Throw an error with a message
    }
};

// Function to fetch all posts
export const getAllPosts = async () => {
    try {
        // Fetch all documents from the video collection
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId
        );

        // Shuffle the posts array to randomize the order
        const shuffledPosts = posts.documents.sort(() => Math.random() - 0.5);

        return shuffledPosts; // Return the shuffled posts
    } catch (error) {
        throw new Error(error.message || 'Error fetching all posts'); // Throw an error with a message
    }
};

// Function to fetch the latest posts
export const getLatestPosts = async () => {
    try {
        // Fetch the latest 7 posts, ordered by creation date
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(7)] // Query to order by creation date and limit results
        );
        return posts.documents; // Return the latest posts
    } catch (error) {
        throw new Error(error.message || 'Error fetching latest posts'); // Throw an error with a message
    }
};

// Function to search posts by query
export const searchPosts = async (query) => {
    try {
        // Split the query into individual words
        const words = query.split(' ');

        // Create an array of search queries for each word
        const searchQueries = words.map((word) => Query.search('title', word));

        // Fetch posts that match any of the search queries
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            searchQueries
        );

        return posts.documents; // Return the matching posts
    } catch (error) {
        throw new Error(error.message || 'Error searching posts'); // Throw an error with a message
    }
};

// Function to fetch posts created by a specific user
export const getUserPosts = async (userId) => {
    try {
        // Fetch all posts where the creator matches the given user ID
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.equal('creator', userId)] // Query to filter by creator ID
        );
        return posts.documents; // Return the user's posts
    } catch (error) {
        throw new Error(error.message || 'Error fetching user posts'); // Throw an error with a message
    }
};
// Function to sign out the current user
export const signOut = async () => {
    try {
        // Delete the current session
        await account.deleteSession('current');
    } catch (error) {
        // Throw an error if sign-out fails
        throw new Error(error.message || 'Error signing out');
    }
};

// Function to get a file preview URL
export const getFilePreview = async (fileId, type) => {
    let fileUrl;

    try {
        // Generate a file preview URL based on the file type
        if (type === 'video') {
            fileUrl = storage.getFileView(storageId, fileId); // Get video file view URL
        } else if (type === 'image') {
            fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100); // Get image preview URL
        } else {
            throw new Error('Invalid file type'); // Throw an error for unsupported file types
        }

        if (!fileUrl) throw new Error('Failed to get file preview'); // Throw an error if the URL is not generated

        return fileUrl; // Return the generated file URL
    } catch (error) {
        throw new Error(error.message); // Throw an error with a message
    }
};

// Function to upload a file to Appwrite storage
export const uploadFile = async (file, type) => {
    if (!file) return null; // Return null if no file is provided

    // Prepare the file asset object
    const asset = {
        name: file.fileName,
        type: file.mimeType,
        size: file.fileSize,
        uri: file.uri,
    };

    try {
        // Upload the file to Appwrite storage
        const uploadFile = await storage.createFile(
            storageId,
            ID.unique(), // Generate a unique ID for the file
            asset
        );

        // Get the file preview URL
        const fileUrl = await getFilePreview(uploadFile.$id, type);
        return fileUrl; // Return the file URL
    } catch (error) {
        throw new Error(error.message); // Throw an error with a message
    }
};

// Function to create a new video post
export const createVideo = async (form) => {
    try {
        // Upload the thumbnail and video files concurrently
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail, 'image'), // Upload thumbnail
            uploadFile(form.video, 'video'), // Upload video
        ]);

        // Create a new video document in the database
        const newPost = await databases.createDocument(
            databaseId,
            videoCollectionId,
            ID.unique(), // Generate a unique ID for the document
            {
                thumbnail: thumbnailUrl, // Thumbnail URL
                video: videoUrl, // Video URL
                title: form.title, // Video title
                creator: form.userId, // Creator's user ID
                sport: form.sport, // Sport category
            }
        );

        return newPost; // Return the created video document
    } catch (error) {
        throw new Error(error.message); // Throw an error with a message
    }
};

// Function to like a video
export const likeVideo = async (videoId, userId) => {
    try {
        // Retrieve the current video document
        const videoDoc = await databases.getDocument(databaseId, videoCollectionId, videoId);

        // Ensure the likedBy field is an array
        const likedByArray = Array.isArray(videoDoc.likedBy) ? videoDoc.likedBy : [];

        // If the user already liked the video, return the document
        if (likedByArray.includes(userId)) {
            return videoDoc;
        }

        // Append the userId to the likedBy array
        const updatedLikedBy = [...likedByArray, userId];

        // Update the document with the new likedBy array
        const updatedDoc = await databases.updateDocument(
            databaseId,
            videoCollectionId,
            videoId,
            { likedBy: updatedLikedBy }
        );
        return updatedDoc; // Return the updated document
    } catch (error) {
        throw new Error(error.message || 'Error liking video'); // Throw an error with a message
    }
};

  // Function to add a comment to a video
export const addComment = async (videoId, userId, username, commentText) => {
    try {
        // Create a new comment document in the comments collection
        const comment = await databases.createDocument(
            databaseId, // Database ID
            commentCollectionId, // Comments collection ID
            ID.unique(), // Generate a unique ID for the comment
            {
                videoId, // ID of the video being commented on
                userId, // ID of the user adding the comment
                username, // Username of the commenter
                comment: commentText, // The comment text
                createdAt: new Date().toISOString() // Timestamp of when the comment was created
            }
        );
        return comment; // Return the created comment document
    } catch (error) {
        throw new Error(error.message || 'Error adding comment'); // Throw an error if the operation fails
    }
};

// Function to fetch all comments for a specific video
export const getCommentsForVideo = async (videoId) => {
    try {
        // Query the comments collection for comments related to the given video ID
        const response = await databases.listDocuments(
            databaseId, // Database ID
            commentCollectionId, // Comments collection ID
            [Query.equal('videoId', videoId)] // Filter by video ID
        );
        return response.documents; // Return the list of comments
    } catch (error) {
        throw new Error(error.message || 'Error fetching comments'); // Throw an error if the operation fails
    }
};

// Function to delete a specific comment
export const deleteComment = async (commentId) => {
    try {
        // Delete the comment document by its ID
        await databases.deleteDocument(databaseId, commentCollectionId, commentId);
        return true; // Return true if the deletion is successful
    } catch (error) {
        throw new Error(error.message || 'Error deleting comment'); // Throw an error if the operation fails
    }
};

// Function to delete a specific video
export const deleteVideo = async (videoId) => {
    try {
        // Delete the video document by its ID
        await databases.deleteDocument(databaseId, videoCollectionId, videoId);
        return true; // Return true if the deletion is successful
    } catch (error) {
        throw new Error(error.message || 'Error deleting video'); // Throw an error if the operation fails
    }
};

// Function to fetch a user and their associated posts
export const getUserAndPosts = async (userId) => {
    try {
        // Query the user collection to find the user document by account ID
        const userResponse = await databases.listDocuments(
            databaseId, // Database ID
            userCollectionId, // User collection ID
            [Query.equal('accountId', userId)] // Filter by account ID
        );

        if (!userResponse.documents.length) {
            throw new Error("No user found for this account ID."); // Throw an error if no user is found
        }

        const userDoc = userResponse.documents[0]; // Get the user document
        const userDocumentId = userDoc.$id; // Extract the user's document ID
        console.log("User Document ID:", userDocumentId); // Log the user document ID

        // Query the video collection to find all posts created by the user
        const postsResponse = await databases.listDocuments(
            databaseId, // Database ID
            videoCollectionId, // Video collection ID
            [Query.equal('creator', userDocumentId)] // Filter by creator ID
        );

        console.log("Number of posts found:", postsResponse.documents.length); // Log the number of posts found

        return { user: userDoc, posts: postsResponse.documents }; // Return the user document and their posts
    } catch (error) {
        console.error("Error fetching user and posts:", error); // Log the error
        throw new Error(error.message || "Error fetching user and posts"); // Throw an error if the operation fails
    }
};
  