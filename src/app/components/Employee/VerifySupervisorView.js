"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../axiosInstance";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { StyledDatePicker } from "../../styles/commonStyles";

const VerifySupervisorsView = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [dateRanges, setDateRanges] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    axiosInstance.get("users/not-verified").then((res) => {
      setUsers(res.data.users);
      setRoles(res.data.roles ? res.data.roles : []);
    });
  }, []);

  const handleConfirm = async (user) => {
    const result = await Swal.fire({
      title: `Confirm ${user.firstName} ${user.lastName}?`,
      text: "This will activate their account and assign a role.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, continue",
    });
    if (!result.isConfirmed) return;

    const role = selectedRoles[user.expertis];
    const from = dateRanges[user.expertis]?.from || dayjs().format("YYYY-MM-DD");
    const to = dateRanges[user.expertis]?.to || null;

    if (!role) {
      Swal.fire("Role required", "Please select a role before confirming.", "warning");
      return;
    }

    const roleName = roles.find((r) => r.id === role)?.name;

    if (!roleName) {
      Swal.fire("Role not found", "Please select a valid role before confirming.", "warning");
      return;
    }
    
    try {
      await axiosInstance.post("/users/verify-account", {
        expertis: user.expertis,
        roleName: roleName,
        validFrom: from,
        validTo: to,
      });

      setUsers((prev) => prev.filter((u) => u.expertis !== user.expertis));
      Swal.fire("Success", "User verified and role assigned.", "success");
    } catch (err) {}
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.expertis.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q)
    );
  });

  return (
    <Box sx={{ p: 3, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" , color: "white"}}>
      <Typography variant="h4" align="center" gutterBottom>
        Verify Supervisors
      </Typography>
  
      <TextField
        fullWidth
        placeholder="Search by Expertis, First or Last Name"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 3,
          backgroundColor: "white",
          borderRadius: 2,
          input: { color: "black" },
          "& .MuiInputLabel-root": { color: "#ccc" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ffffff30" },
        }}
      />
  
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          paddingRight: 1,
        }}
      >
        <AnimatePresence>
          {filteredUsers.map((user) => (
            <motion.div
              key={user.expertis}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  backgroundColor: "white",
                  backdropFilter: "blur(6px)",
                  border: "1px solid #ffffff22",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.expertis} | {user.department}, {user.team}
                  </Typography>

                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={selectedRoles[user.expertis] || ""}
                      label="Role"
                      onChange={(e) =>
                        setSelectedRoles((prev) => ({
                          ...prev,
                          [user.expertis]: e.target.value,
                        }))
                      }
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          <Tooltip title={role.description || "No description"}>
                            <span>{role.name}</span>
                          </Tooltip>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <StyledDatePicker
                        label="Valid From"
                        value={dayjs(dateRanges[user.expertis]?.from || dayjs())}
                        onChange={(newValue) =>
                          setDateRanges((prev) => ({
                            ...prev,
                            [user.expertis]: {
                              ...(prev[user.expertis] || {}),
                              from: newValue.format("YYYY-MM-DD"),
                            },
                          }))
                        }
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                          },
                        }}
                      />
                      <StyledDatePicker
                        label="Valid To"
                        value={dateRanges[user.expertis]?.to ? dayjs(dateRanges[user.expertis].to) : null}
                        onChange={(newValue) =>
                          setDateRanges((prev) => ({
                            ...prev,
                            [user.expertis]: {
                              ...(prev[user.expertis] || {}),
                              to: newValue ? newValue.format("YYYY-MM-DD") : null,
                            },
                          }))
                        }
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<CheckCircleIcon />}
                    sx={{ mt: 2, fontWeight: "bold" }}
                    onClick={() => handleConfirm(user)}
                  >
                    Confirm Account
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
  
        {filteredUsers.length === 0 && (
          <Box sx={{ textAlign: "center", color: "text.secondary", mt: 4 }}>
            No users pending verification.
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default VerifySupervisorsView;