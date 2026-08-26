import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Create context
const AuthContext = createContext();

// Custom hook to use auth
export const useAuth = () => useContext(AuthContext);

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Create user profile in Firestore
  const createUserProfile = async (firebaseUser, displayName) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: displayName || firebaseUser.displayName || 'User',
      photoURL: firebaseUser.photoURL || null,
      role: 'user',
      isPremium: false,
      premiumSince: null,
      premiumExpiry: null,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
    return userRef;
  };

  // Sign up new user
  const signup = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await createUserProfile(userCredential.user, displayName);
      return userCredential;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Update last login
      const userRef = doc(db, "users", userCredential.user.uid);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
      return userCredential;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, updates);
      
      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  // Update email
  const updateUserEmail = async (newEmail) => {
    try {
      await updateEmail(auth.currentUser, newEmail);
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { email: newEmail });
      setUser({ ...user, email: newEmail });
      return true;
    } catch (error) {
      console.error("Update email error:", error);
      throw error;
    }
  };

  // Update password
  const updateUserPassword = async (newPassword) => {
    try {
      await updatePassword(auth.currentUser, newPassword);
      return true;
    } catch (error) {
      console.error("Update password error:", error);
      throw error;
    }
  };

  // Set premium status (called after successful payment)
  const setUserPremium = async (value) => {
    try {
      if (!user) throw new Error('No user logged in');
      const userRef = doc(db, "users", user.uid);
      
      const updates = {
        isPremium: value,
        updatedAt: serverTimestamp(),
      };
      
      if (value) {
        updates.premiumSince = serverTimestamp();
        updates.premiumExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
      }
      
      await updateDoc(userRef, updates);
      setIsPremium(value);
      return true;
    } catch (error) {
      console.error("Set premium error:", error);
      throw error;
    }
  };

  // Check if premium is still valid
  const checkPremiumStatus = async () => {
    try {
      if (!user) return false;
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.isPremium && data.premiumExpiry) {
          const expiry = new Date(data.premiumExpiry);
          if (expiry < new Date()) {
            // Premium expired
            await updateDoc(userRef, { isPremium: false });
            setIsPremium(false);
            return false;
          }
          setIsPremium(true);
          return true;
        }
        setIsPremium(false);
        return false;
      }
      return false;
    } catch (error) {
      console.error("Check premium error:", error);
      return false;
    }
  };

  // Fetch user data from Firestore
  const fetchUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserRole(data.role || 'user');
        setIsPremium(data.isPremium || false);
        return data;
      } else {
        // If no profile exists, create one
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          await createUserProfile(firebaseUser);
          setUserRole('user');
          setIsPremium(false);
        }
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserRole('user');
      setIsPremium(false);
      return null;
    }
  };

  // Make user admin (only for the main admin)
  const makeAdmin = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { role: 'admin' });
      if (uid === user?.uid) {
        setUserRole('admin');
      }
      return true;
    } catch (error) {
      console.error("Make admin error:", error);
      throw error;
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthError('');
      
      if (firebaseUser) {
        // User is logged in
        setUser(firebaseUser);
        
        try {
          // Fetch user data from Firestore
          const userData = await fetchUserData(firebaseUser.uid);
          
          if (userData) {
            setUserRole(userData.role || 'user');
            setIsPremium(userData.isPremium || false);
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
          setUserRole('user');
          setIsPremium(false);
        }
      } else {
        // User is logged out
        setUser(null);
        setUserRole('user');
        setIsPremium(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check premium status periodically (every hour)
  useEffect(() => {
    if (!user) return;
    
    const checkInterval = setInterval(() => {
      checkPremiumStatus();
    }, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(checkInterval);
  }, [user]);

  // Context value
  const value = {
    // User data
    user,
    userRole,
    isPremium,
    loading,
    authError,
    
    // Helper booleans
    isAdmin: userRole === 'admin',
    isAuthenticated: !!user,
    
    // Auth functions
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    setUserPremium,
    makeAdmin,
    checkPremiumStatus,
    fetchUserData,
    
    // Setters (for manual updates)
    setUserRole,
    setIsPremium,
    setAuthError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;