"use client";

import React, { createContext, useContext, useState } from "react";
import AppWithInterceptor from "./AppWithInterceptor.js";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState("welcome");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorOverlay, setErrorOverlay] = useState({ open: false, message: "" });
  const [selectedExpertis, setSelectedExpertis] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [user, setUser] = useState(null);

  const contextValue = {
    currentView,
    setCurrentView,
    isLoggedIn,
    setIsLoggedIn,
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
      <AppWithInterceptor>{children}</AppWithInterceptor>
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