// Import necessary hooks and components
import { useState, useEffect } from "react";
import { Alert } from "react-native";

// Custom hook to handle Appwrite API calls
const useAppwrite = (fn) => {
    // State to store the fetched data
    const [data, setData] = useState([]);
    // State to track the loading status
    const [isLoading, setIsLoading] = useState(true);

    // Function to fetch data from the provided API function
    const fetchData = async () => {
        setIsLoading(true); // Set loading state to true before fetching
        try {
            const response = await fn(); // Call the provided API function
            setData(response); // Update the data state with the response
        } catch (error) {
            Alert.alert('Error'); // Show an alert if an error occurs
        } finally {
            setIsLoading(false); // Set loading state to false after fetching
        }
    };

    // useEffect to fetch data when the component mounts
    useEffect(() => {
        fetchData(); // Call fetchData on mount
    }, []); // Empty dependency array ensures this runs only once

    // Function to manually refetch the data
    const refetch = () => fetchData();

    // Return the data, loading state, and refetch function
    return { data, isLoading, refetch };
};

export default useAppwrite; // Export the custom hook for use in other components