import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../../axiosInstance";


const TemplateAssignment = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [tempMonth, setTempMonth] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [daysArray, setDaysArray] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState(0);

  useEffect(() => {
    if (!selectedMonth) return;

    const startOfMonth = selectedMonth.startOf("month");
    const endOfMonth = selectedMonth.endOf("month");

    const fetchData = async () => {
      try {
        const [usersResponse, templateResponse] = await Promise.all([
          axiosInstance.get(`/attendance/getListWithout?start=${startOfMonth.format("YYYY-MM-DD")}&end=${endOfMonth.format("YYYY-MM-DD")}`),
          axiosInstance.get(`/attendance/getScheduleByDate?date=${startOfMonth.format("YYYY-MM-DD")}`),
        ]);

        const empData = usersResponse.data.map((emp) => ({ ...emp, id: emp.expertis, selected: false }));
        setEmployees(empData);
        setFilteredEmployees(empData);
        setTemplates(templateResponse.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();

    setDaysInMonth(selectedMonth.daysInMonth());
    setDaysArray(Array.from({ length: selectedMonth.daysInMonth() }, (_, i) => i + 1));
  }, [selectedMonth]);

  const handleTemplateSelect = (templateId) => {
    const template = templates.find((temp) => temp.id === templateId);
    setSelectedTemplate(template);
    setFilteredEmployees((prev) => prev.map((emp) => ({ ...emp, selected: false })));
  };

  const handleEmployeeSelection = (empId) => {
    setFilteredEmployees((prev) =>
      prev.map((emp) =>
        emp.expertis === empId ? { ...emp, selected: !emp.selected } : emp
      )
    );
  };

  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    const filteredExpertis = filteredEmployeesList.map(emp => emp.expertis);
    
    setFilteredEmployees((prev) =>
      prev.map((emp) => 
        filteredExpertis.includes(emp.expertis) 
          ? { ...emp, selected: isChecked } 
          : emp
      )
    );
  };

  const removeSelectedEmployee = (empId) => {
    setFilteredEmployees((prev) =>
      prev.map((emp) =>
        emp.expertis === empId ? { ...emp, selected: false } : emp
      )
    );
  };

  const filteredEmployeesList = filteredEmployees.filter((emp) => {
    const searchLower = searchText.toLowerCase();
    return (
      (searchText
        ? String(emp.expertis).toLowerCase().includes(searchLower) ||
          emp.firstName.toLowerCase().includes(searchLower) ||
          emp.lastName.toLowerCase().includes(searchLower)
        : true) &&
      (departmentFilter ? emp.department === departmentFilter : true) &&
      (teamFilter ? emp.team === teamFilter : true)
    );
  });

  const selectedEmployees = filteredEmployees.filter((emp) => emp.selected);

  const assignEmployees = async () => {
    const selectedExpertis = selectedEmployees.map((emp) => emp.expertis);
    const templateName = selectedTemplate.nameScheduleTemplate;

    try {
      const response = await axiosInstance.post("/attendance/setScheduleTemplate", {
        expertisList: selectedExpertis,
        scheduleName: selectedTemplate.nameScheduleTemplate
      });
      setFilteredEmployees(filteredEmployees.map((emp) => ({ ...emp, selected: false }))); 
      setSelectedTemplate(null);
      setSearchText("");
      setDepartmentFilter("");
      setTeamFilter("");

      setEmployees(employees.filter((emp) => !selectedExpertis.includes(emp.expertis)));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={["month", "year"]}
            label="Choose Month"
            value={tempMonth}
            onChange={(newValue) => setTempMonth(newValue)}
            onAccept={(newValue) => setSelectedMonth(newValue)}
            slotProps={{
              textField: { sx: { bgcolor: "#FFF", width: 250 } },
            }}
          />
        </LocalizationProvider>
      </Box>

      {selectedMonth && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">Available Templates</Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `320px repeat(${daysInMonth}, 1fr)`,
              gap: "1px",
              bgcolor: "#E0E0E0",
            }}
          >
            <Box sx={{ bgcolor: "#FFF", p: 1, borderBottom: "1px solid #E0E0E0" }}>
              Templates
            </Box>
            {daysArray.map((day) => (
              <Box
                key={day}
                sx={{
                  bgcolor: "#FFF",
                  p: 1,
                  textAlign: "center",
                  borderBottom: "1px solid #E0E0E0",
                }}
              >
                {day}
              </Box>
            ))}
            {templates.map((temp) => (
              <React.Fragment key={temp.id}>
                <Box
                  onClick={() => handleTemplateSelect(temp.id)}
                  sx={{
                    bgcolor: selectedTemplate?.id === temp.id ? "#E0F7FA" : "#FFF",
                    border: selectedTemplate?.id === temp.id ? "2px solid #1976D2" : "1px solid #E0E0E0",
                    p: 1,
                    borderRadius: 1,
                    boxShadow: 1,
                    alignItems: "center",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.3,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#F0F0F0" },
                  }}
                >
                  <Typography variant="subtitle1">
                    {temp.nameScheduleTemplate} - {temp.fullNameCreator.firstName} -{" "}
                    {temp.fullNameCreator.lastName}
                  </Typography>
                </Box>
                {daysArray.map((day, colIndex) => {
                  const attendanceForDay = temp.schedule[day];
                  const cellContent = attendanceForDay ? attendanceForDay.statusCode : "";
                  const shiftSymbol = attendanceForDay?.shiftCode ? attendanceForDay.shiftCode : "";
                  return (
                    <Box
                      key={colIndex}
                      sx={{
                        position: "relative",
                        bgcolor: cellContent && cellContent === "W" ? "black" : "white",
                        p: 1,
                        textAlign: "center",
                        justifyContent: "center",
                        display: "flex",
                        alignItems: "center",
                        borderBottom: "1px solid #E0E0E0",
                        cursor: "pointer",
                        fontWeight: "bold",
                        color: cellContent && cellContent === "W" ? "white" : "black",
                        "&:hover": { bgcolor: "#F0F0F0" },
                      }}
                    >
                      {cellContent === "''" ? "" : cellContent}
                      {shiftSymbol && (
                        <Typography
                          variant="caption"
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            fontSize: "1rem",
                            fontWeight: "bold",
                            color: "#333",
                          }}
                        >
                          {shiftSymbol}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </React.Fragment>
            ))}
          </Box>
        </Paper>
      )}

      {selectedTemplate && (
        <Box sx={{ display: "flex", gap: 2 }}>
          <Paper sx={{ p: 2, flex: 3 }}>
            <Typography variant="h6">Employee List</Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="Search by Name or Expertis"
                variant="outlined"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ minWidth: 250 }}
              />
              <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="Department"
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {Array.from(new Set(employees.map((emp) => emp.department))).map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                <InputLabel>Team</InputLabel>
                <Select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  label="Team"
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {Array.from(new Set(employees.map((emp) => emp.team))).map((team) => (
                    <MenuItem key={team} value={team}>
                      {team}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={filteredEmployeesList}
                columns={[
                  {
                    field: "select",
                    headerName: "Select",
                    width: 120,
                    renderHeader: () => (
                      <Checkbox
                        onChange={handleSelectAll}
                        checked={filteredEmployeesList.length > 0 && filteredEmployeesList.every((emp) => emp.selected)}
                      />
                    ),
                    renderCell: (params) => (
                      <Checkbox
                        checked={params.row.selected || false}
                        onChange={() => handleEmployeeSelection(params.row.expertis)}
                      />
                    ),
                  },
                  { field: "expertis", headerName: "Expertis", flex: 1 },
                  { field: "firstName", headerName: "First Name", flex: 1 },
                  { field: "lastName", headerName: "Last Name", flex: 1 },
                  { field: "department", headerName: "Department", flex: 1 },
                  { field: "team", headerName: "Team", flex: 1 },
                ]}
                pageSize={5}
                checkboxSelection={false}
                disableSelectionOnClick
                components={{
                  NoRowsOverlay: () => (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", p: 2 }}>
                      No employees found for the selected filters.
                    </Box>
                  ),
                }}
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 2, flex: 1, maxHeight: 400, overflowY: "auto" }}>
            <Typography variant="h6">Selected Employees</Typography>
            {selectedEmployees.length === 0 ? (
              <Typography variant="body2">No employees selected.</Typography>
            ) : (
              selectedEmployees.map((emp) => (
                <Box
                  key={emp.expertis}
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}
                >
                  <Typography variant="body2">
                    {emp.firstName} {emp.lastName} ({emp.expertis})
                  </Typography>
                  <IconButton onClick={() => removeSelectedEmployee(emp.expertis)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))
            )}
          </Paper>
        </Box>
      )}

      {selectedEmployees.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button variant="contained" onClick={assignEmployees}>
            Assign Selected Employees
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TemplateAssignment;