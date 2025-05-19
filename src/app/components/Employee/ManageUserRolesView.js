"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../axiosInstance";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { StyledDatePicker } from "../../styles/commonStyles";
import BlockIcon from "@mui/icons-material/Block";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const ManageUserRolesView = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    roleId: "",
    from: dayjs(),
    to: null,
  });

  useEffect(() => {
    axiosInstance.get("users/verified").then((res) => {
      setUsers(res.data.users);
      setRoles(res.data.roles ? res.data.roles : []);
    });
  }, []);

  const handleAddRole = async (user) => {
    setSelectedUser(user);
    setNewRole({
      roleId: "",
      from: dayjs(),
      to: null,
    });
    setIsDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!newRole.roleId) {
      Swal.fire("Error", "Please select a role", "error");
      return;
    }

    try {
      const role = roles.find((r) => r.id === newRole.roleId);

      setIsDialogOpen(false);

      await axiosInstance.post("/users/assign-role", {
        expertis: selectedUser.expertis,
        roleName: role.name,
        validFrom: newRole.from.format("YYYY-MM-DD"),
        validTo: newRole.to ? newRole.to.format("YYYY-MM-DD") : null,
      });

      Swal.fire("Success", "Role assigned successfully", "success");
    } catch (error) {
      setIsDialogOpen(false);
    }
  };

  const handleRemoveRole = async (user, roleId) => {
    const result = await Swal.fire({
      title: "Remove Role?",
      text: "Are you sure you want to remove this role?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it",
    });

    if (result.isConfirmed) {
      try {
        const role = roles.find((r) => r.id === roleId);
        await axiosInstance.get(`/users/remove-role?expertis=${user.expertis}&roleName=${role.name}`);

        Swal.fire("Success", "Role removed successfully", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to remove role", "error");
      }
    }
  };

  const handleBanUser = async (user) => {
    const result = await Swal.fire({
      title: "Ban User?",
      text: "This will revoke all roles and access. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, ban user",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.post("/users/notVerified", {
          expertis: user.expertis,
        });

        Swal.fire("Success", "User has been banned", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to ban user", "error");
      }
    }
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
    <Box sx={{ p: 3, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", color: "white" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Manage User Roles
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
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Box>
                      <Typography variant="h6" color="text.primary">
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.expertis} | {user.department}, {user.team}
                      </Typography>
                    </Box>
                    <Tooltip title="Ban User">
                      <IconButton
                        color="error"
                        onClick={() => handleBanUser(user)}
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(211, 47, 47, 0.1)",
                          },
                        }}
                      >
                        <BlockIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Current Roles:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {user.roles?.map((role) => (
                        <Chip
                          key={`${role.userId}-${role.roleId}`}
                          label={`${role.name} (${dayjs(role.validFrom).format("DD/MM/YYYY")} - ${
                            role.validTo ? dayjs(role.validTo).format("DD/MM/YYYY") : "∞"
                          })`}
                          onDelete={() => handleRemoveRole(user, role.roleId)}
                          color="primary"
                          variant="outlined"
                          sx={{
                            "& .MuiChip-deleteIcon": {
                              color: "primary.main",
                              "&:hover": {
                                color: "error.main",
                              },
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    fullWidth
                    onClick={() => handleAddRole(user)}
                    sx={{
                      mt: 1,
                      borderColor: "primary.main",
                      color: "primary.main",
                      "&:hover": {
                        borderColor: "primary.dark",
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                      },
                    }}
                  >
                    Add Role
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredUsers.length === 0 && (
          <Box sx={{ textAlign: "center", color: "text.secondary", mt: 4 }}>
            No users found.
          </Box>
        )}
      </Box>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: "white",
          },
        }}
      >
        <DialogTitle>Add New Role</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newRole.roleId}
                label="Role"
                onChange={(e) => setNewRole((prev) => ({ ...prev, roleId: e.target.value }))}
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

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <StyledDatePicker
                  label="Valid From"
                  value={newRole.from}
                  onChange={(newValue) =>
                    setNewRole((prev) => ({
                      ...prev,
                      from: newValue,
                    }))
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
                <StyledDatePicker
                  label="Valid To"
                  value={newRole.to}
                  onChange={(newValue) =>
                    setNewRole((prev) => ({
                      ...prev,
                      to: newValue,
                    }))
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveRole}
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
              },
            }}
          >
            Save Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageUserRolesView; 