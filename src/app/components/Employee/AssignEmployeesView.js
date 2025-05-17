"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Collapse,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Swal from 'sweetalert2';
import Autocomplete from "@mui/material/Autocomplete";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../../axiosInstance";

const CustomNoRowsOverlay = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      p: 2,
      fontSize: 16,
    }}
  >
    No employees found for the selected filters.
  </Box>
);

const AssignEmployeesModern = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [selectedEmployeesPanel, setSelectedEmployeesPanel] = useState([]);
  // Filter states for DataGrid
  const [searchText, setSearchText] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  // Feedback states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mismatchWarning, setMismatchWarning] = useState("");

  // Fetch supervisors and employees on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supRes, empRes] = await Promise.all([
          axiosInstance.get("employee/getSupervisor"),
          axiosInstance.get("employee/getEmployeeWithoutSupervisor"),
        ]);
        setSupervisors(supRes.data);
        // Map employees, using expertis as unique id
        const empData = empRes.data.map(emp => ({ ...emp, id: emp.expertis }));
        setEmployees(empData);
        setFilteredEmployees(empData);
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
      }
    };
    fetchData();
  }, []);

  // Filter employees based on search text and dropdown filters
  useEffect(() => {
    let filtered = employees;
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.firstName.toLowerCase().includes(lowerSearch) ||
        emp.lastName.toLowerCase().includes(lowerSearch) ||
        emp.expertis.toLowerCase().includes(lowerSearch)
      );
    }
    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }
    if (teamFilter) {
      filtered = filtered.filter(emp => emp.team === teamFilter);
    }
    setFilteredEmployees(filtered);
  }, [searchText, departmentFilter, teamFilter, employees]);

  // Unique values for filters
  const departments = [...new Set(employees.map(emp => emp.department))];
  const teams = [...new Set(employees.map(emp => emp.team))];

  // When supervisor is selected, auto-set department and team filters
  const handleSupervisorSelect = (event, newValue) => {
    setSelectedSupervisor(newValue);
    if (newValue) {
      setDepartmentFilter(newValue.department);
      setTeamFilter(newValue.team);
    }
  };

  // Add employee from DataGrid to side panel
  const handleAddEmployee = (emp) => {
    if (selectedEmployeesPanel.some(e => e.id === emp.id)) return;
    // Add with empty validFrom and validTo (user can edit these)
    setSelectedEmployeesPanel([...selectedEmployeesPanel, { ...emp, validFrom: "", validTo: "" }]);
  };

  // Remove employee from side panel
  const handleRemoveEmployee = (empId) => {
    setSelectedEmployeesPanel(selectedEmployeesPanel.filter(emp => emp.id !== empId));
  };

  // Update validFrom/validTo for an employee in side panel
  const handleDateChange = (empId, field, value) => {
    setSelectedEmployeesPanel(selectedEmployeesPanel.map(emp => {
      if (emp.id === empId) {
        return { ...emp, [field]: value };
      }
      return emp;
    }));
  };

  // Check for mismatch between supervisor and selected employees
  useEffect(() => {
    if (selectedSupervisor && selectedEmployeesPanel.length > 0) {
      const mismatches = selectedEmployeesPanel.filter(emp => 
        emp.department !== selectedSupervisor.department || emp.team !== selectedSupervisor.team
      );
      setMismatchWarning(mismatches.length > 0 ? "Some selected employees are not from the same department or team as the supervisor." : "");
    } else {
      setMismatchWarning("");
    }
  }, [selectedSupervisor, selectedEmployeesPanel]);

  // DataGrid columns definition
  const columns = [
    { field: "expertis", headerName: "Expertis", flex: 1 },
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "department", headerName: "Department", flex: 1 },
    { field: "team", headerName: "Team", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button variant="contained" size="small" onClick={() => handleAddEmployee(params.row)}>
          Add
        </Button>
      ),
    },
  ];

  // Handler for assignment button
  const handleAssign = async () => {
    setError("");
    setSuccess("");
    if (!selectedSupervisor) {
      setError("Please select a supervisor.");
      return;
    }
    if (selectedEmployeesPanel.length === 0) {
      setError("Please add at least one employee.");
      return;
    }
    if (mismatchWarning) {
        const result = await Swal.fire({
          title: 'Warning',
          text: mismatchWarning + " Do you want to proceed anyway?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, assign',
          cancelButtonText: 'Cancel'
        });
        if (!result.isConfirmed) {
          return;
        }
      }
    const payload = [
      {
        supervisorExpertis: selectedSupervisor.expertis,
        requests: {},
      },
    ];
    const today = new Date().toISOString().split("T")[0];
    selectedEmployeesPanel.forEach(emp => {
      payload[0].requests[emp.id] = {
        validFrom: emp.validFrom || today,
        validTo: emp.validTo || null,
      };
    });
    try {
      await axiosInstance.post("employee/setEmployeeToSupervisor", payload);
      setSuccess("Employees successfully assigned to supervisor.");

      setEmployees(employees.filter(emp => !selectedEmployeesPanel.some(e => e.id === emp.id)));
      setFilteredEmployees(filteredEmployees.filter(emp => !selectedEmployeesPanel.some(e => e.id === emp.id)));

      setSelectedSupervisor(null);
      setSelectedEmployeesPanel([]);
      setError("");
      setMismatchWarning("");
      setSearchText("");
      setDepartmentFilter("");
      setTeamFilter("");

    } catch (err) {
      console.error(err);
      setError("Failed to assign employees.");
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Assign Employees to Supervisor
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {mismatchWarning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {mismatchWarning}
        </Alert>
      )}
      {/* Supervisor selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Autocomplete
          options={supervisors}
          getOptionLabel={(option) =>
            `${option.expertis} ${option.firstName} ${option.lastName} (${option.department}, ${option.team})`
          }
          value={selectedSupervisor}
          onChange={handleSupervisorSelect}
          renderInput={(params) => (
            <TextField {...params} label="Select Supervisor" variant="outlined" />
          )}
        />
      </Paper>
      {/* Main Content Layout: Left DataGrid and Right Selected Employees Panel */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* DataGrid Section */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                mb: 2,
                justifyContent: "center",
              }}
            >
              <TextField
                label="Search by Name or Expertis"
                variant="outlined"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ minWidth: 250 }}
              />
              <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                <InputLabel id="dept-select-label">Department</InputLabel>
                <Select
                  labelId="dept-select-label"
                  label="Department"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                <InputLabel id="team-select-label">Team</InputLabel>
                <Select
                  labelId="team-select-label"
                  label="Team"
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {teams.map((team) => (
                    <MenuItem key={team} value={team}>
                      {team}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ height: 600, width: "100%" }}>
              <DataGrid
                rows={filteredEmployees}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                checkboxSelection={false}
                disableSelectionOnClick
                components={{ NoRowsOverlay: CustomNoRowsOverlay }}
              />
            </Box>
          </Paper>
        </Box>
        {/* Selected Employees Panel (fixed width) */}
        <Box sx={{ width: 350 }}>
          <Paper sx={{ p: 2, maxHeight: 705, overflowY: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Selected Employees
            </Typography>
            {selectedEmployeesPanel.length === 0 ? (
              <Typography variant="body2">No employees selected.</Typography>
            ) : (
              selectedEmployeesPanel.map((emp) => (
                <Collapse key={emp.id} in>
                  <Paper
                    sx={{
                      p: 1,
                      mb: 1,
                      position: "relative",
                      border: "1px solid #ccc",
                      borderRadius: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{ position: "absolute", top: 0, right: 0 }}
                      onClick={() => handleRemoveEmployee(emp.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="subtitle2">
                      {emp.firstName} {emp.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {emp.expertis}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <TextField
                        label="Valid From"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={emp.validFrom}
                        onChange={(e) =>
                          handleDateChange(emp.id, "validFrom", e.target.value)
                        }
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Valid To"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={emp.validTo}
                        onChange={(e) =>
                          handleDateChange(emp.id, "validTo", e.target.value)
                        }
                        fullWidth
                        size="small"
                      />
                    </Box>
                  </Paper>
                </Collapse>
              ))
            )}
          </Paper>
        </Box>
      </Box>
      {/* Assignment Button */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button variant="contained" color="primary" onClick={handleAssign}>
          Assign Selected Employees
        </Button>
      </Box>
    </Box>
  );
};

export default AssignEmployeesModern;