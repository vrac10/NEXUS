import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of the context
interface UserContextType {
  userId: string | null;
  setUserId: (id: string | null) => void;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);

  // Load the user ID from storage when the app starts
  useEffect(() => {
    const loadUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    };
    loadUserId();
  }, []);

  // Save the user ID to storage when it changes
  const handleSetUserId = async (id: string | null) => {
    setUserId(id);
    if (id) {
      await AsyncStorage.setItem('userId', id);
    } else {
      await AsyncStorage.removeItem('userId'); // Clear on logout
    }
  };

  return (
    <UserContext.Provider value={{ userId, setUserId: handleSetUserId }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
