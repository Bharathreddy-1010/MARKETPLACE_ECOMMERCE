import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [onboardingProfile, setOnboardingProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('texflow_token');
    if (token) {
      api.getMe()
        .then(res => {
          setUser(res.user);
          setOnboardingProfile(res.onboardingProfile);
          if (res.user && !res.user.onboardingCompleted) {
            setShowOnboardingModal(true);
          }
        })
        .catch(err => {
          console.error('Failed to restore session:', err);
          localStorage.removeItem('texflow_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('texflow_token', res.token);
    setUser(res.user);
    setOnboardingProfile(res.onboardingProfile);
    if (res.user && !res.user.onboardingCompleted) {
      setShowOnboardingModal(true);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('texflow_token', res.token);
    setUser(res.user);
    setShowOnboardingModal(true);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('texflow_token');
    setUser(null);
    setOnboardingProfile(null);
    setShowOnboardingModal(false);
  };

  const updateOnboarding = async (profileData) => {
    const res = await api.saveOnboarding(profileData);
    setOnboardingProfile(res.profile);
    setUser(prev => prev ? { ...prev, onboardingCompleted: true } : null);
    setShowOnboardingModal(false);
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        onboardingProfile,
        loading,
        login,
        register,
        logout,
        updateOnboarding,
        showOnboardingModal,
        setShowOnboardingModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
