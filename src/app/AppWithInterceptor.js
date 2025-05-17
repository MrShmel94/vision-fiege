"use client";

import React, { useEffect, useRef } from "react";
import axiosInstance from "./axiosInstance";
import { useAppContext } from "./AppContext";

const AppWithInterceptor = ({ children }) => {
  const context = useAppContext();
  const { setIsLoading, setErrorOverlay } = context;
  const requestInterceptorRef = useRef(null);
  const responseInterceptorRef = useRef(null);

  useEffect(() => {
    // Add request interceptor first
    requestInterceptorRef.current = axiosInstance.interceptors.request.use(
      (config) => {
        setIsLoading(true);
        return config;
      }
    );

    // Add response interceptor first
    responseInterceptorRef.current = axiosInstance.interceptors.response.use(
      (response) => {
        setIsLoading(false);
        return response;
      },
      async (error) => {
        setIsLoading(false);
        setErrorOverlay({
          open: true,
          message: error.response?.data?.message || "An unexpected error occurred",
        });
        return Promise.reject(error);
      }
    );

    // Cleanup function
    return () => {
      if (requestInterceptorRef.current !== null) {
        axiosInstance.interceptors.request.eject(requestInterceptorRef.current);
      }
      if (responseInterceptorRef.current !== null) {
        axiosInstance.interceptors.response.eject(responseInterceptorRef.current);
      }
    };
  }, [context]);

  return children;
};

export default AppWithInterceptor;