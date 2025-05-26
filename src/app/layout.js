"use client";

import React from "react";
import { Box, CssBaseline } from "@mui/material";
import { SnackbarProvider } from "notistack";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import theme, { gradientBackground } from "./theme";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { store } from "./store";
import { AppProvider, useAppContext } from "./AppContext";
import { NotificationProvider } from "./components/Global/GlobalNotification";
import GlobalLoader from "./components/Global/GlobalLoader";
import ErrorOverlay from "./components/Global/ErrorOverlay";
import AppWrapper from "./components/AppWrapper";


function LayoutContent({ children }) {
  const { isLoggedIn } = useAppContext();

  if (!isLoggedIn) return null;

  return (
    <>
      <Box sx={gradientBackground} />
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          padding: 2,
          gap: 2,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Sidebar />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Topbar />
          <Box
            sx={{
              flex: 1,
              bgcolor: "rgba(0, 0, 0, 0.6)",
              borderRadius: 3,
              p: 3,
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              overflow: "auto",
              height: "calc(100vh - 120px)",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider maxSnack={3}>
              <AppProvider>
                <AppWrapper>
                  <GlobalLoader />
                  <ErrorOverlay />
                  <NotificationProvider>
                    <LayoutContent>{children}</LayoutContent>
                  </NotificationProvider>
                </AppWrapper>
              </AppProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}