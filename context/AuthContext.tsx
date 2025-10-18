
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
// FIX: Added file extensions to imports
import { User, UserProfile } from '../types.ts';
// FIX: Added file extensions to imports
import * as DB from '../services/mockDb.ts';
// FIX: Added file extensions to imports
import { auth } from '../services/mockDb.ts';
import { onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<FirebaseUser | null>;
  signup: (username: string, email: string, pass: string, profile: Omit<UserProfile, 'bio'>) => Promise<FirebaseUser | null>;
  logout: () => void;
  updateCurrentUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await DB.getUserById(firebaseUser.uid);
        if (userProfile) {
          setCurrentUser(userProfile);
        } else {
          // This case might happen if the user exists in Auth but not in Firestore.
          // Handle appropriately, e.g., by creating a profile or logging out.
          console.error("User profile not found in Firestore for authenticated user.");
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<FirebaseUser | null> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  }, []);
  
  const signup = useCallback(async (username: string, email: string, pass: string, profile: Omit<UserProfile, 'bio'>): Promise<FirebaseUser | null> => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      if (firebaseUser) {
        const newUser: User = {
          id: firebaseUser.uid,
          username,
          email,
          profilePicUrl: null,
          createdAt: new Date().toISOString(),
          profile: {
            ...profile,
            bio: `Hi, I'm ${username}. Let's study together!`,
          }
        };
        await DB.createUserProfile(newUser);
        setCurrentUser(newUser); // Set current user immediately after profile creation
      }
      return firebaseUser;
  }, []);

  const logout = useCallback(() => {
    signOut(auth);
    setCurrentUser(null);
  }, []);
  
  const updateCurrentUser = useCallback(async (user: User) => {
    await DB.updateUser(user);
    setCurrentUser(user);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout, updateCurrentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
