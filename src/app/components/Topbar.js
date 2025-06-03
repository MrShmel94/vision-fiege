"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Menu,
  MenuItem,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import { useAppContext } from "../AppContext";
import axiosInstance from "../axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import UploadPerformanceModal from "./Modal/UploadPerformanceModal";

const Topbar = () => {
  const theme = useTheme();
  const { user, setUser, setIsLoggedIn, setCurrentView, setErrorOverlay, setSelectedExpertis, setInitialData } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [uploadAnchorEl, setUploadAnchorEl] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileMenu = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("auth/logout");
      setUser(null);
      setIsLoggedIn(false);
      setCurrentView("welcome");
      setSelectedExpertis(null);
      setInitialData(null);
      sessionStorage.clear();
      if (window.caches) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setErrorOverlay({
        open: true,
        message: "Failed to logout. Please try again."
      });
    }
    handleProfileClose();
  };

  const handleUploadMenu = (event) => {
    setUploadAnchorEl(event.currentTarget);
  };

  const handleUploadClose = () => {
    setUploadAnchorEl(null);
  };

  const handleUploadClick = (type) => {
    handleUploadClose();
    if (type === 'performance') {
      setIsUploadModalOpen(true);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) {
      Swal.fire({
        title: "Search Query Too Short",
        text: "Please enter at least 3 characters to search",
        icon: "info",
        confirmButtonColor: "#B82136",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await axiosInstance.get(
        `employee/searchQuery/${encodeURIComponent(searchQuery)}`
      );
      const results = response.data;
      setSearchResults(results);

      if (results.length === 1) {
        handleEmployeeSelect(results[0]);
      }
    } catch (error) {
      setErrorOverlay({
        open: true,
        message: "Failed to search employees. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedExpertis(employee.expertis);
    setInitialData(employee);
    setCurrentView("employeeCard");
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <Box
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(8px)",
        borderRadius: 3,
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        position: "relative",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
        <Typography variant="h6" color="black">
          Dashboard
        </Typography>
        <Box ref={searchRef} sx={{ position: "relative", flex: 1, maxWidth: 500 }}>
          <motion.div
            animate={{
              width: isSearchOpen ? "100%" : "200px",
              opacity: isSearchOpen ? 1 : 0.7,
            }}
            transition={{ duration: 0.3 }}
            style={{ position: "relative" }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Expertis/Name..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsSearchOpen(true)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {searchQuery && (
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults([]);
                          }}
                        >
                          <ClearIcon />
                        </IconButton>
                      )}
                      {searchQuery.length >= 3 && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={handleSearch}
                          startIcon={<SearchIcon />}
                          sx={{
                            borderRadius: "20px",
                            textTransform: "none",
                            backgroundColor: "#B82136",
                            "&:hover": {
                              backgroundColor: "#8f1a2a",
                            },
                          }}
                        >
                          Search
                        </Button>
                      )}
                    </Box>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                  },
                  paddingRight: "8px",
                },
              }}
            />
          </motion.div>

          <AnimatePresence>
            {isSearchOpen && searchResults.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  marginTop: 4,
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    maxHeight: 300,
                    overflow: "auto",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {isSearching ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <List>
                      {searchResults.map((employee) => (
                        <ListItem
                          key={employee.expertis}
                          button
                          onClick={() => handleEmployeeSelect(employee)}
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          <ListItemText
                            primary={`${employee.firstName} ${employee.lastName}`}
                            secondary={`Expertis: ${employee.expertis}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleUploadMenu}
            sx={{
              borderRadius: "20px",
              textTransform: "none",
              backgroundColor: "#B82136",
              "&:hover": {
                backgroundColor: "#8f1a2a",
              },
              mr: 1,
            }}
          >
            Upload
          </Button>
        </motion.div>

        <Menu
          anchorEl={uploadAnchorEl}
          open={Boolean(uploadAnchorEl)}
          onClose={handleUploadClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              minWidth: "200px",
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem
            onClick={() => handleUploadClick('performance')}
            sx={{
              py: 1.5,
              "&:hover": {
                backgroundColor: "rgba(184, 33, 54, 0.1)",
              },
            }}
          >
            <UploadIcon sx={{ mr: 1, fontSize: 20, color: "#B82136" }} />
            Performance File
          </MenuItem>
        </Menu>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <IconButton
            onClick={handleProfileMenu}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
              padding: "8px",
              borderRadius: "12px",
              mr: 1,
            }}
          >
            <PersonIcon sx={{ color: "black" }} />
          </IconButton>
        </motion.div>

        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={handleProfileClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              minWidth: "200px",
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {user && [
            <Box key="user-info" sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: theme.palette.primary.main }}
              >
                {user.firstName} {user.lastName}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                {user.position}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                {user.department}
              </Typography>
            </Box>,
            <Divider key="divider" />,
            <MenuItem
              key="logout"
              onClick={handleLogout}
              sx={{
                py: 1.5,
                color: theme.palette.error.main,
                "&:hover": {
                  backgroundColor: theme.palette.error.light + "20",
                },
              }}
            >
              <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
              Logout
            </MenuItem>
          ]}
          {!user && (
            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1.5,
                color: theme.palette.error.main,
                "&:hover": {
                  backgroundColor: theme.palette.error.light + "20",
                },
              }}
            >
              <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
              Logout
            </MenuItem>
          )}
        </Menu>

        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          sx={{
            borderRadius: "20px",
            textTransform: "none",
            backgroundColor: "#B82136",
            "&:hover": {
              backgroundColor: "#8f1a2a",
            },
          }}
        >
          Logout
        </Button>
      </Box>

      <UploadPerformanceModal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </Box>
  );
};

export default Topbar;