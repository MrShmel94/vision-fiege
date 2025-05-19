"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Swal from 'sweetalert2';
import Autocomplete from "@mui/material/Autocomplete";
import DeleteIcon from "@mui/icons-material/Delete";
import AddAllIcon from '@mui/icons-material/AddToQueue';
import RemoveAllIcon from '@mui/icons-material/RemoveFromQueue';
import axiosInstance from "../../axiosInstance";
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useAppContext } from "../../AppContext";

const CustomNoRowsOverlay = React.memo(() => (
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
));

const EmployeeCard = React.memo(({ data, index, style }) => {
  const emp = data[index];
  return (
    <Paper
      style={style}
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
        onClick={() => data.onRemove(emp.id)}
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
          onChange={(e) => data.onDateChange(emp.id, "validFrom", e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          label="Valid To"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={emp.validTo}
          onChange={(e) => data.onDateChange(emp.id, "validTo", e.target.value)}
          fullWidth
          size="small"
        />
      </Box>
    </Paper>
  );
});

const AssignEmployeesModern = () => {
  const { 
    setIsLoading, 
    setErrorOverlay,
    setCurrentView,
    selectedExpertis,
    setSelectedExpertis 
  } = useAppContext();

  const [supervisors, setSupervisors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [selectedEmployeesPanel, setSelectedEmployeesPanel] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [mismatchWarning, setMismatchWarning] = useState("");
  const [isLoading, setIsLoadingLocal] = useState(true);

  const [isPending, startTransition] = React.useTransition();

  const departments = useMemo(() => 
    [...new Set(employees.map(emp => emp.department))],
    [employees]
  );

  const teams = useMemo(() => 
    [...new Set(employees.map(emp => emp.team))],
    [employees]
  );

  const visibleEmployees = useMemo(() => {
    let filtered = employees;
    
    if (selectedSupervisor) {
      filtered = filtered.filter(emp => emp.expertis !== selectedSupervisor.expertis);
    }

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
    return filtered;
  }, [employees, searchText, departmentFilter, teamFilter, selectedSupervisor]);

  const availableEmployees = useMemo(() => 
    visibleEmployees.filter(emp => !selectedEmployeesPanel.some(e => e.id === emp.id)),
    [visibleEmployees, selectedEmployeesPanel]
  );

  const columns = useMemo(() => [
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
        <Button 
          variant="contained" 
          size="small" 
          onClick={() => handleAddEmployee(params.row)}
          disabled={selectedEmployeesPanel.some(e => e.id === params.row.id)}
        >
          Add
        </Button>
      ),
    },
  ], [selectedEmployeesPanel]);

  const handleAddEmployee = useCallback((emp) => {
    startTransition(() => {
      setSelectedEmployeesPanel(prev => [...prev, { ...emp, validFrom: "", validTo: "" }]);
    });
  }, []);

  const handleRemoveEmployee = useCallback((empId) => {
    startTransition(() => {
      setSelectedEmployeesPanel(prev => prev.filter(emp => emp.id !== empId));
    });
  }, []);

  const handleAddAllVisible = useCallback(() => {
    startTransition(() => {
      setSelectedEmployeesPanel(prev => {
        const newEmployees = availableEmployees.map(emp => ({ 
          ...emp, 
          validFrom: "", 
          validTo: "" 
        }));
        return [...prev, ...newEmployees];
      });
    });
  }, [availableEmployees]);

  const handleRemoveAll = useCallback(() => {
    startTransition(() => {
      setSelectedEmployeesPanel([]);
    });
  }, []);

  const handleDateChange = useCallback((empId, field, value) => {
    startTransition(() => {
      setSelectedEmployeesPanel(prev => 
        prev.map(emp => emp.id === empId ? { ...emp, [field]: value } : emp)
      );
    });
  }, []);

  const handleSupervisorSelect = useCallback((event, newValue) => {
    // If there was a previous supervisor, add them back to the employee list
    if (selectedSupervisor) {
      const prevSupervisor = supervisors.find(s => s.expertis === selectedSupervisor.expertis);
      if (prevSupervisor) {
        setEmployees(prev => [...prev, prevSupervisor]);
      }
    }

    // If selecting a new supervisor, remove them from the employee list
    if (newValue) {
      setEmployees(prev => prev.filter(emp => emp.expertis !== newValue.expertis));
      setDepartmentFilter(newValue.department);
      setTeamFilter(newValue.team);
      setSelectedExpertis(newValue.expertis);
    }

    setSelectedSupervisor(newValue);
  }, [selectedSupervisor, supervisors, setSelectedExpertis]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingLocal(true);
      try {
        const [supRes, empRes] = await Promise.all([
          axiosInstance.get("employee/getSupervisor"),
          axiosInstance.get("employee/getEmployeeWithoutSupervisor"),
        ]);
        setSupervisors(supRes.data);
        const empData = empRes.data.map(emp => ({ ...emp, id: emp.expertis }));
        setEmployees(empData);
      } catch (err) {
        console.error(err);
        setErrorOverlay({
          open: true,
          message: "Failed to load data. Please try again.",
          title: "Error"
        });
      } finally {
        setIsLoadingLocal(false);
      }
    };
    fetchData();
  }, [setErrorOverlay]);

  useEffect(() => {
    if (selectedSupervisor && selectedEmployeesPanel.length > 0) {
      const mismatches = selectedEmployeesPanel.filter(emp => 
        emp.department !== selectedSupervisor.department || emp.team !== selectedSupervisor.team
      );
      setMismatchWarning(mismatches.length > 0 ? 
        "Some selected employees are not from the same department or team as the supervisor." : 
        ""
      );
    } else {
      setMismatchWarning("");
    }
  }, [selectedSupervisor, selectedEmployeesPanel]);

  const handleAssign = useCallback(async () => {
    if (!selectedSupervisor) {
      setErrorOverlay({
        open: true,
        message: "Please select a supervisor.",
        title: "Validation Error"
      });
      return;
    }
    if (selectedEmployeesPanel.length === 0) {
      setErrorOverlay({
        open: true,
        message: "Please add at least one employee.",
        title: "Validation Error"
      });
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
      if (!result.isConfirmed) return;
    }

    try {
      const payload = [{
        supervisorExpertis: selectedSupervisor.expertis,
        requests: {},
      }];

      const today = new Date().toISOString().split("T")[0];
      selectedEmployeesPanel.forEach(emp => {
        payload[0].requests[emp.id] = {
          validFrom: emp.validFrom || today,
          validTo: emp.validTo || null,
        };
      });

      await axiosInstance.post("employee/setEmployeeToSupervisor", payload);
      
      // Reset state and show success
      setEmployees(prev => prev.filter(emp => !selectedEmployeesPanel.some(e => e.id === emp.id)));
      setSelectedSupervisor(null);
      setSelectedEmployeesPanel([]);
      setMismatchWarning("");
      setSearchText("");
      setDepartmentFilter("");
      setTeamFilter("");
      setSelectedExpertis(null);

      // Navigate back to dashboard
      setCurrentView("dashboard");

    } catch (err) {
      console.error(err);
      setErrorOverlay({
        open: true,
        message: "Failed to assign employees. Please try again.",
        title: "Error"
      });
    }
  }, [selectedSupervisor, selectedEmployeesPanel, mismatchWarning, setErrorOverlay, setCurrentView, setSelectedExpertis]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Assign Employees to Supervisor
      </Typography>
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
      <Box sx={{ display: "flex", gap: 2 }}>
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
                rows={availableEmployees}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                checkboxSelection={false}
                disableSelectionOnClick
                components={{ NoRowsOverlay: CustomNoRowsOverlay }}
                loading={isLoading}
                density="compact"
                disableColumnMenu
                disableColumnFilter
                disableColumnSelector
              />
            </Box>
          </Paper>
        </Box>
        {/* Selected Employees Panel with virtualization */}
        <Box sx={{ width: 350 }}>
          <Paper sx={{ p: 2, height: 705, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Selected Employees ({selectedEmployeesPanel.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Add all visible employees">
                  <IconButton 
                    onClick={handleAddAllVisible}
                    color="primary"
                    disabled={availableEmployees.length === 0 || isPending}
                  >
                    <AddAllIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove all selected employees">
                  <IconButton 
                    onClick={handleRemoveAll}
                    color="error"
                    disabled={selectedEmployeesPanel.length === 0 || isPending}
                  >
                    <RemoveAllIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {selectedEmployeesPanel.length === 0 ? (
              <Typography variant="body2">No employees selected.</Typography>
            ) : (
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height}
                      width={width}
                      itemCount={selectedEmployeesPanel.length}
                      itemSize={120}
                      itemData={{
                        ...selectedEmployeesPanel,
                        onRemove: handleRemoveEmployee,
                        onDateChange: handleDateChange
                      }}
                    >
                      {EmployeeCard}
                    </List>
                  )}
                </AutoSizer>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
      {/* Assignment Button */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAssign}
          disabled={selectedEmployeesPanel.length === 0 || !selectedSupervisor}
        >
          Assign Selected Employees
        </Button>
      </Box>
    </Box>
  );
};

export default React.memo(AssignEmployeesModern);