"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import AppWithInterceptor from "./AppWithInterceptor.js";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {

  const [currentView, setCurrentView] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [errorOverlay, setErrorOverlay] = useState({ open: false, title: "", message: "" });
  const [selectedExpertis, setSelectedExpertis] = useState(null);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    //TODO: check if user is logged in
    setIsLoggedIn(true);
    setInitialized(true);
  }, []);

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
    setInitialData
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
    console.error("🚨 useAppContext called outside of AppProvider!");
  }
  return context;
};