"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  AppBar, 
  Toolbar, 
  Box, 
  Button, 
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Fade,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { useAppContext } from "../AppContext";
import axiosInstance from "../axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import Swal from 'sweetalert2';

export default function Topbar() {
  const { setCurrentView, isLoggedIn, setIsLoggedIn, setErrorOverlay, setSelectedExpertis, setInitialData } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
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

  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) {
      Swal.fire({
        title: 'Search Query Too Short',
        text: 'Please enter at least 3 characters to search',
        icon: 'info',
        confirmButtonColor: '#B82136',
        confirmButtonText: 'OK'
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await axiosInstance.get(`employee/searchQuery/${encodeURIComponent(searchQuery)}`);
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
    if (event.key === 'Enter') {
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
        <Typography variant="h6" color="black">Dashboard</Typography>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                            borderRadius: '20px',
                            textTransform: 'none',
                            backgroundColor: '#B82136',
                            '&:hover': {
                              backgroundColor: '#8f1a2a',
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
                  paddingRight: '8px',
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
      {isLoggedIn && (
        <Button 
          variant="contained" 
          color="error" 
          onClick={() => setIsLoggedIn(false)}
        >
          Logout
        </Button>
      )}
    </Box>
  );
}