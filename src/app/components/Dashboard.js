"use client";

import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Button, Avatar, IconButton, Dialog, DialogTitle, DialogActions, DialogContent, TextField, Select, MenuItem } from "@mui/material";
import axiosInstance from "../axiosInstance";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppContext } from "../AppContext";

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const { setCurrentView, setSelectedExpertis, setErrorOverlay } = useAppContext();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState("menu");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get("employee/getEmployeeBySupervisor");
        setEmployees(response.data);
      } catch (error) {
        setErrorOverlay({
          open: true,
          message: error.response?.data?.message || "Failed to fetch employees. Please try again.",
        });
      }
    };

    fetchEmployees();
  }, [setErrorOverlay]);

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Если работник выбран – показываем меню выбора */}
      {selectedEmployee ? (
        viewMode === "menu" ? (
          <EmployeeMenu
            employee={selectedEmployee}
            setCurrentView={setCurrentView}
            setSelectedExpertis={setSelectedExpertis}
            onBack={() => setViewMode("menu")}
            onView={() => setViewMode("view")}
            onEdit={() => setViewMode("edit")}
          />
        ) : viewMode === "view" ? (
          <EmployeeProfile employee={selectedEmployee} onBack={() => setViewMode("menu")} />
        ) : (
          <EmployeeEditForm employee={selectedEmployee} onBack={() => setViewMode("menu")} />
        )
      ) : (
        <>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
            Employee Dashboard
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", maxWidth: "1200px" }}>
            {employees.map((employee) => (
              <Card
                key={employee.expertis}
                sx={{
                  width: 250,
                  borderRadius: 3,
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.05)", boxShadow: "0 8px 16px rgba(0,0,0,0.2)" },
                  cursor: "pointer",
                }}
                onClick={() => setSelectedEmployee(employee)}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Avatar sx={{ width: 56, height: 56, margin: "auto", bgcolor: "#B82136" }}>
                    {employee.firstName[0]}
                  </Avatar>
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
                    {employee.firstName} {employee.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {employee.positionName}
                  </Typography>
                  <Button variant="contained" color="primary" size="small" sx={{ mt: 1, borderRadius: 2 }}>
                    Select
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

// Меню выбора действия
const EmployeeMenu = ({ employee, setCurrentView, setSelectedExpertis, onBack , onView, onEdit}) => {
  return (
    <Box sx={{ width: "100%", maxWidth: 500, bgcolor: "#fff", borderRadius: 3, p: 3, boxShadow: "0 4px 10px rgba(0,0,0,0.2)", textAlign: "center" }}>
      <IconButton onClick={onBack}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
        {employee.firstName} {employee.lastName}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {employee.positionName} - {employee.departmentName}
      </Typography>
      <Button variant="contained" color="primary" fullWidth sx={{ mb: 1 }} onClick={() => {
        setSelectedExpertis(employee.expertis);
        setCurrentView('employeeCard');
      }}>
        View Profile
      </Button>
      <Button variant="contained" color="secondary" fullWidth sx={{ mb: 1 }} onClick={""}>
        Edit Profile
      </Button>
    </Box>
  );
};

// Профиль работника
const EmployeeProfile = ({ employee, onBack }) => {
  return (
    <Box sx={{ width: "100%", maxWidth: 800, bgcolor: "#fff", borderRadius: 3, p: 3, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
      <IconButton onClick={onBack}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
        {employee.firstName} {employee.lastName}
      </Typography>
      <Typography variant="h6" color="textSecondary">
        {employee.positionName} - {employee.departmentName}
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        <b>Expertis:</b> {employee.expertis}
      </Typography>
      <Typography variant="body1">
        <b>Team:</b> {employee.teamName}
      </Typography>
      <Typography variant="body1">
        <b>Country:</b> {employee.countryName}
      </Typography>
      <Typography variant="body1">
        <b>Agency:</b> {employee.agencyName}
      </Typography>
    </Box>
  );
};

// Форма редактирования
const EmployeeEditForm = ({ employee, onBack }) => {
  const [formData, setFormData] = useState({ ...employee });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      await axiosInstance.put(`/employee/update/${employee.id}`, formData);
      alert("Employee updated successfully!");
      onBack();
    } catch (error) {
      console.error("Failed to update employee", error);
      alert("Failed to update employee.");
    }
  };

  return (
    <Dialog open={true} onClose={onBack} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Employee</DialogTitle>
      <DialogContent>
        <TextField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        <TextField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        <Select name="sex" value={formData.sex} onChange={handleChange} fullWidth sx={{ mb: 2 }}>
          <MenuItem value="M">Male</MenuItem>
          <MenuItem value="F">Female</MenuItem>
        </Select>
        <TextField label="Position" name="positionName" value={formData.positionName} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        <TextField label="Department" name="departmentName" value={formData.departmentName} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onBack} color="secondary">Cancel</Button>
        <Button onClick={handleSave} color="primary" variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Dashboard;