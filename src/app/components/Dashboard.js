"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Avatar, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogActions, 
  DialogContent, 
  TextField,
  Select,
  MenuItem,
  InputAdornment
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import axiosInstance from "../axiosInstance";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppContext } from "../AppContext";
import { PageHeader, PageHeaderTitle, PageHeaderSubtitle, PageContent, CenteredCard } from "../styles/commonStyles";
import Swal from 'sweetalert2';

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { setCurrentView, setSelectedExpertis, setErrorOverlay } = useAppContext();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState("menu");

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    
    const query = searchQuery.toLowerCase();
    return employees.filter(emp => 
      emp.firstName.toLowerCase().includes(query) ||
      emp.lastName.toLowerCase().includes(query) ||
      emp.expertis.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

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

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleSave = async (formData) => {
    try {
      await axiosInstance.put(`/employee/update/${formData.id}`, formData);
      await Swal.fire({
        title: 'Success!',
        text: 'Employee updated successfully!',
        icon: 'success',
        confirmButtonColor: '#B82136'
      });
      setViewMode("menu");
    } catch (error) {
      setErrorOverlay({
        open: true,
        message: "Failed to update employee. Please try again.",
      });
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageHeaderTitle>
          Employee Dashboard
        </PageHeaderTitle>
        <PageHeaderSubtitle>
          Manage and view employee information
        </PageHeaderSubtitle>
      </PageHeader>

      {selectedEmployee ? (
        viewMode === "menu" ? (
          <EmployeeMenu
            employee={selectedEmployee}
            setCurrentView={setCurrentView}
            setSelectedExpertis={setSelectedExpertis}
            onBack={() => setSelectedEmployee(null)}
            onView={() => setViewMode("view")}
            onEdit={() => setViewMode("edit")}
            employees={employees}
            setEmployees={setEmployees}
          />
        ) : viewMode === "view" ? (
          <EmployeeProfile 
            employee={selectedEmployee} 
            onBack={() => setViewMode("menu")} 
          />
        ) : (
          <EmployeeEditForm 
            employee={selectedEmployee} 
            onBack={() => setViewMode("menu")}
            onSave={handleSave}
          />
        )
      ) : (
        <PageContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by name or expertis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            />
          </Box>

          <Box sx={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: 2, 
            justifyContent: "center"
          }}>
            {filteredEmployees.map((employee) => (
              <Card
                key={employee.expertis}
                sx={{
                  width: 250,
                  borderRadius: 3,
                  transition: "0.3s",
                  "&:hover": { 
                    transform: "scale(1.05)", 
                    boxShadow: "0 8px 16px rgba(0,0,0,0.2)" 
                  },
                  cursor: "pointer",
                }}
                onClick={() => handleEmployeeClick(employee)}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      margin: "auto", 
                      bgcolor: "#B82136",
                      fontSize: '1.5rem'
                    }}
                  >
                    {employee.firstName[0]}
                  </Avatar>
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
                    {employee.firstName} {employee.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {employee.positionName}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                    {employee.expertis}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="small" 
                    sx={{ 
                      mt: 1, 
                      borderRadius: 2,
                      bgcolor: '#B82136',
                      '&:hover': {
                        bgcolor: '#8f1a2a',
                      }
                    }}
                  >
                    Select
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </PageContent>
      )}
    </Box>
  );
};

const EmployeeMenu = ({ 
  employee, 
  setCurrentView, 
  setSelectedExpertis, 
  onBack, 
  onView, 
  onEdit,
  employees,
  setEmployees 
}) => {
  const handleRemoveEmployee = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to remove ${employee.firstName} ${employee.lastName} from your supervision?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E30613',
      cancelButtonColor: '#666',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const requestData = {
          "supervisorExpertis": employee.supervisorExpertis,
          "employeeExpertis": [employee.expertis]
        };

        await axiosInstance.post('/employee/deleteEmployeeToSupervisor', requestData);
        
        await Swal.fire({
          title: 'Success!',
          text: 'Employee has been removed from your supervision.',
          icon: 'success',
          confirmButtonColor: '#E30613'
        });

        setEmployees(employees.filter(emp => emp.expertis !== employee.expertis));
        onBack();
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to remove employee. Please try again.',
          icon: 'error',
          confirmButtonColor: '#E30613'
        });
      }
    }
  };

  return (
    <CenteredCard>
      <Box sx={{ textAlign: "center" }}>
        <IconButton 
          onClick={onBack}
          sx={{ 
            position: 'absolute',
            left: 16,
            top: 16,
            color: '#E30613',
            '&:hover': {
              backgroundColor: 'rgba(227, 6, 19, 0.1)',
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            margin: '0 auto 16px', 
            bgcolor: '#E30613',
            fontSize: '2rem'
          }}
        >
          {employee.firstName[0]}
        </Avatar>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold", color: '#E30613' }}>
          {employee.firstName} {employee.lastName}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          {employee.expertis}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          {employee.positionName} - {employee.departmentName}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, margin: '0 auto' }}>
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ 
              bgcolor: '#E30613',
              '&:hover': {
                bgcolor: '#B30000',
              },
              py: 1.5,
              borderRadius: 2
            }} 
            onClick={() => {
              setSelectedExpertis(employee.expertis);
              setCurrentView('employeeCard');
            }}
          >
            View Profile
          </Button>
          <Button 
            variant="outlined" 
            fullWidth 
            sx={{ 
              borderColor: '#E30613',
              color: '#E30613',
              '&:hover': {
                borderColor: '#B30000',
                bgcolor: 'rgba(227, 6, 19, 0.1)',
              },
              py: 1.5,
              borderRadius: 2
            }}
            onClick={handleRemoveEmployee}
          >
            Remove from Supervision
          </Button>
        </Box>
      </Box>
    </CenteredCard>
  );
};

const EmployeeProfile = ({ employee, onBack }) => {
  return (
    <CenteredCard>
      <Box sx={{ position: 'relative' }}>
        <IconButton 
          onClick={onBack}
          sx={{ 
            position: 'absolute',
            left: -8,
            top: -8,
            color: '#E30613',
            '&:hover': {
              backgroundColor: 'rgba(227, 6, 19, 0.1)',
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              margin: '0 auto 16px', 
              bgcolor: '#E30613',
              fontSize: '2rem'
            }}
          >
            {employee.firstName[0]}
          </Avatar>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold", color: '#E30613' }}>
            {employee.firstName} {employee.lastName}
          </Typography>
          <Typography variant="h6" color="textSecondary">
            {employee.positionName} - {employee.departmentName}
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 3,
          maxWidth: 600,
          margin: '0 auto'
        }}>
          <InfoField label="Expertis" value={employee.expertis} />
          <InfoField label="Team" value={employee.teamName} />
          <InfoField label="Country" value={employee.countryName} />
          <InfoField label="Agency" value={employee.agencyName} />
        </Box>
      </Box>
    </CenteredCard>
  );
};

const InfoField = ({ label, value }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {value}
    </Typography>
  </Box>
);

const EmployeeEditForm = ({ employee, onBack, onSave }) => {
  const [formData, setFormData] = useState({ ...employee });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <CenteredCard>
      <Box sx={{ position: 'relative' }}>
        <IconButton 
          onClick={onBack}
          sx={{ 
            position: 'absolute',
            left: -8,
            top: -8,
            color: '#E30613',
            '&:hover': {
              backgroundColor: 'rgba(227, 6, 19, 0.1)',
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: '#E30613' }}>
          Edit Employee
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          maxWidth: 500,
          margin: '0 auto'
        }}>
          <TextField 
            label="First Name" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleChange} 
            fullWidth 
          />
          <TextField 
            label="Last Name" 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleChange} 
            fullWidth 
          />
          <Select 
            name="sex" 
            value={formData.sex} 
            onChange={handleChange} 
            fullWidth
          >
            <MenuItem value="M">Male</MenuItem>
            <MenuItem value="F">Female</MenuItem>
          </Select>
          <TextField 
            label="Position" 
            name="positionName" 
            value={formData.positionName} 
            onChange={handleChange} 
            fullWidth 
          />
          <TextField 
            label="Department" 
            name="departmentName" 
            value={formData.departmentName} 
            onChange={handleChange} 
            fullWidth 
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button 
              onClick={onBack} 
              variant="outlined" 
              fullWidth
              sx={{ 
                borderColor: '#E30613',
                color: '#E30613',
                '&:hover': {
                  borderColor: '#B30000',
                  bgcolor: 'rgba(227, 6, 19, 0.1)',
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => onSave(formData)} 
              variant="contained" 
              fullWidth
              sx={{ 
                bgcolor: '#E30613',
                '&:hover': {
                  bgcolor: '#B30000',
                }
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Box>
    </CenteredCard>
  );
};

export default Dashboard;