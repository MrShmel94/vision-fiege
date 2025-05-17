"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  InputAdornment,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import { useAppContext } from "../AppContext";
import * as Yup from "yup";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CodeIcon from "@mui/icons-material/Code";
import dynamic from "next/dynamic";
import drone from "../resources/dron.json";
import biometricScan from "../resources/biometric_scaner.json";
import axiosInstance from "../axiosInstance";
import { motion, AnimatePresence } from "framer-motion";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const validationSchemas = {
  login: Yup.object({
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string()
      .min(8, "Minimum 8 characters")
      .matches(/[A-Z]/, "Must include an uppercase letter")
      .matches(/[!@#$%^&*]/, "Must include a special character")
      .required("Password is required"),
  }),
  register: Yup.object({
    email: Yup.string().email("Invalid email format").required("Email is required"),
    expertis: Yup.string()
      .matches(/^\d+$/, "Expertis must contain only numbers")
      .required("Expertis is required"),
    brCode: Yup.string()
      .matches(/^BR-\d+$/, "BR-Code must start with 'BR-' followed by numbers only")
      .required("BR-Code is required"),
    password: Yup.string()
      .min(8, "Minimum 8 characters")
      .matches(/[A-Z]/, "Must include an uppercase letter")
      .matches(/[!@#$%^&*]/, "Must include a special character")
      .required("Password is required"),
  }),
};

const AuthForm = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { setIsLoggedIn } = useAppContext();
  const [tab, setTab] = useState(0);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  const loginFormik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: validationSchemas.login,
    onSubmit: async (values) => {
      try {
        const response = await axiosInstance.post("users/login", values);
        loginFormik.resetForm();
        enqueueSnackbar("Login successful!", { variant: "success", autoHideDuration: 3000 });
        setAccessGranted(true);
        setTimeout(() => setIsLoggedIn(true), 1500);
      } catch (error) {
        // Error handling is done globally by AppWithInterceptor
      }
    },
  });

  const registerFormik = useFormik({
    initialValues: { email: "", expertis: "", brCode: "", password: "" },
    validationSchema: validationSchemas.register,
    onSubmit: async (values) => {
      try {
        await axiosInstance.post("users/sign-up", values);
        enqueueSnackbar(
          "Registration successful! Please check your email to complete the registration process.",
          { 
            variant: "success", 
            autoHideDuration: 5000,
            action: (key) => (
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => {
                  const email = values.email;
                  const emailDomain = email.split('@')[1];
                  let emailUrl = '';
                  
                  switch(emailDomain) {
                    case 'gmail.com':
                      emailUrl = 'https://mail.google.com';
                      break;
                    case 'outlook.com':
                    case 'hotmail.com':
                      emailUrl = 'https://outlook.live.com';
                      break;
                    case 'yahoo.com':
                      emailUrl = 'https://mail.yahoo.com';
                      break;
                    default:
                      emailUrl = `https://${emailDomain}`;
                  }
                  
                  window.open(emailUrl, '_blank');
                  setTab(0);
                }}
              >
                Go to Email
              </Button>
            ),
          }
        );
        registerFormik.resetForm();
        setTab(0);
      } catch (error) {
        // Handle specific error cases
        if (error.response?.data?.message) {
          const errorMessage = error.response.data.message;
          
          // If user already exists, only clear password
          if (errorMessage.includes("already exists")) {
            registerFormik.setFieldValue("password", "");
            enqueueSnackbar(errorMessage, { 
              variant: "error", 
              autoHideDuration: 4000,
              action: (key) => (
                <Button color="inherit" size="small" onClick={() => setTab(0)}>
                  Go to Login
                </Button>
              ),
            });
          } else {
            // For other errors (like invalid BR-code or employee not found)
            enqueueSnackbar(errorMessage, { 
              variant: "error", 
              autoHideDuration: 4000 
            });
          }
        }
      }
    },
  });

  const currentFormik = tab === 0 ? loginFormik : registerFormik;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", position: "relative", zIndex: 2 }}>
      <AnimatePresence mode="wait">
        {passwordFocused ? (
          <motion.div
            key="scaner"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -200, scale: 0.5, rotate: 20, filter: "blur(3px) brightness(1.2)", transition: { duration: 0.5, ease: "easeInOut" } }}
            transition={{ duration: 0.6, type: "spring" }}
            style={{ position: "absolute", top: 80, width: 250, zIndex: 5 }}
          >
            <Lottie animationData={biometricScan} loop autoplay />
          </motion.div>
        ) : (
          <motion.div
            key="drone"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -200, scale: 0.5, rotate: 20, filter: "blur(3px) brightness(1.2)", transition: { duration: 0.5, ease: "easeInOut" } }}
            transition={{ duration: 0.6, type: "spring" }}
            style={{ position: "absolute", top: 20, width: 200, zIndex: 5 }}
          >
            <Lottie animationData={drone} loop autoplay />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {accessGranted && (
          <motion.div
            key="access"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ position: "absolute", top: 120, zIndex: 6 }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "#00FFB2",
                textShadow: "0 0 10px #00FFB2",
                fontWeight: "bold",
                letterSpacing: 2,
              }}
            >
              ACCESS GRANTED
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card
          sx={{
            width: "100%",
            maxWidth: "420px",
            padding: "20px",
            boxShadow: 3,
            borderRadius: "18px",
            backgroundColor: "#ffffffee",
            backdropFilter: "blur(8px)",
          }}
        >
          <CardContent>
            <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)} variant="fullWidth" sx={{ mb: 2 }}>
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>

            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, x: tab === 0 ? -50 : 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: tab === 0 ? 50 : -50 }} transition={{ duration: 0.4 }}>
                <form onSubmit={currentFormik.handleSubmit}>
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    {...currentFormik.getFieldProps("email")}
                    error={currentFormik.touched.email && Boolean(currentFormik.errors.email)}
                    helperText={currentFormik.touched.email && currentFormik.errors.email}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><MailOutlineIcon /></InputAdornment>) }}
                  />

                  {tab === 1 && (
                    <>
                      <TextField
                        label="Expertis"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...registerFormik.getFieldProps("expertis")}
                        error={registerFormik.touched.expertis && Boolean(registerFormik.errors.expertis)}
                        helperText={registerFormik.touched.expertis && registerFormik.errors.expertis}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><BadgeOutlinedIcon /></InputAdornment>) }}
                      />
                      <TextField
                        label="BR-Code"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...registerFormik.getFieldProps("brCode")}
                        error={registerFormik.touched.brCode && Boolean(registerFormik.errors.brCode)}
                        helperText={registerFormik.touched.brCode && registerFormik.errors.brCode}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><CodeIcon /></InputAdornment>) }}
                      />
                    </>
                  )}

                  <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    {...currentFormik.getFieldProps("password")}
                    error={currentFormik.touched.password && Boolean(currentFormik.errors.password)}
                    helperText={currentFormik.touched.password && currentFormik.errors.password}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><LockOutlinedIcon /></InputAdornment>) }}
                  />
                  <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.5, fontWeight: "bold" }}>
                    {tab === 0 ? "Login" : "Register"}
                  </Button>
                </form>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default AuthForm;