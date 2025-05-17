/** @jsxImportSource @emotion/react */
"use client";

import React, { useMemo } from "react";
import { Box, CssBaseline } from "@mui/material";
import { Global, css } from "@emotion/react";
import { SnackbarProvider } from "notistack";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import theme, { gradientBackground, gradientKeyframes } from "./theme";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { store } from "./store";
import { AppProvider, useAppContext } from "./AppContext";
import { NotificationProvider } from "./components/Global/GlobalNotification";
import GlobalLoader from "./components/Global/GlobalLoader";
import ErrorOverlay from "./components/Global/ErrorOverlay";
import AuthForm from "./components/AuthForm";

const keyframesCSS = css`${gradientKeyframes}`;

function LayoutContent({ children }) {
  const context = useAppContext();
  const { isLoggedIn } = context ?? {};

  return useMemo(() => (
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
        {isLoggedIn ? (
          <>
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
                  display: "flex",
                  flexDirection: "column",
                  overflow: "auto",
                  height: "calc(100vh - 120px)",
                }}
              >
                {children}
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100vw",
              height: "100vh",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <AuthForm />
          </Box>
        )}
      </Box>
    </>
  ), [isLoggedIn, children]);
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <Provider store={store}>
          <AppProvider>
            <GlobalLoader />
            <ErrorOverlay />
            <ThemeProvider theme={theme}>
              <Global styles={keyframesCSS} />
              <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <NotificationProvider>
                  <CssBaseline />
                  <LayoutContent>{children}</LayoutContent>
                </NotificationProvider>
              </SnackbarProvider>
            </ThemeProvider>
          </AppProvider>
        </Provider>
      </body>
    </html>
  );
}