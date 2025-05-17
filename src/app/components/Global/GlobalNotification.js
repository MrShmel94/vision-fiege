"use client";

import React, { createContext, useContext } from "react";
import { useSnackbar } from "notistack";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();

  const notify = (message, variant = "default") => {
    enqueueSnackbar(message, { variant });
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);