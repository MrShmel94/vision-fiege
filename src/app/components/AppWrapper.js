"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../AppContext";
import WelcomeScreen from "./WelcomeScreen";
import AuthForm from "./AuthForm";
import axiosInstance from "../axiosInstance";
import { Global, css } from "@emotion/react";
import { gradientBackground, gradientKeyframes } from "../theme";

const keyframesCSS = css`${gradientKeyframes}`;

const AppWrapper = ({ children }) => {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    setUser, 
    setCurrentView, 
    setErrorOverlay,
    currentView
  } = useAppContext();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get("users/me");
        if (response.data) {
          setUser(response.data);
          setIsLoggedIn(true);
          setCurrentView("dashboard");
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setIsLoggedIn(false);
        setCurrentView("welcome");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setIsLoggedIn, setUser, setCurrentView]);

  if (isLoading) {
    return (
      <>
        <Global styles={keyframesCSS} />
        <Box sx={gradientBackground} />
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Box component="img" src="/logo.png" alt="Loading" sx={{ width: 100, height: 100 }} />
          </motion.div>
        </Box>
      </>
    );
  }

  return (
    <>
      <Global styles={keyframesCSS} />
      <Box sx={gradientBackground} />
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div
            key="unauth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: "relative", zIndex: 1 }}
          >
            {currentView === "auth" ? <AuthForm /> : <WelcomeScreen />}
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{ position: "relative", zIndex: 1 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppWrapper;