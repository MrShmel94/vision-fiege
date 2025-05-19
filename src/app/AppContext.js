"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import AppWithInterceptor from "./AppWithInterceptor.js";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState("welcome");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [errorOverlay, setErrorOverlay] = useState({ open: false, title: "", message: "" });
  const [selectedExpertis, setSelectedExpertis] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          setIsLoggedIn(true);
          setCurrentView('dashboard');
        } else {
          setIsLoggedIn(false);
          setCurrentView('welcome');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoggedIn(false);
        setCurrentView('welcome');
      } finally {
        setInitialized(true);
      }
    };

    checkAuth();
  }, []);

  const contextValue = {
    currentView,
    setCurrentView: (view) => {
      setCurrentView(view);
    },
    isLoggedIn,
    setIsLoggedIn: (loggedIn) => {
      setIsLoggedIn(loggedIn);
    },
    isLoading,
    setIsLoading,
    errorOverlay,
    setErrorOverlay,
    selectedExpertis,
    setSelectedExpertis,
    initialData,
    setInitialData,
    user,
    setUser
  };

  return (
    <AppContext.Provider value={contextValue}>
      {initialized ? <AppWithInterceptor>{children}</AppWithInterceptor> : null}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};