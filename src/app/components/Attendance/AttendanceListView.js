import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Popover,
  FormControl,
  InputLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Tabs,
  Tab,
  Button,
} from "@mui/material";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FixedSizeList as List } from 'react-window';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { 
  StyledDatePicker, 
  StyledMuiSelect, 
  FilterGroup, 
  FilterGroupTitle, 
  FilterGroupContent,
  AttendanceRow 
} from "../../styles/commonStyles";
import dayjs from "dayjs";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axiosInstance from "../../axiosInstance";
import ShiftInfoDialog from "./ShiftInfoDialog";
import AttendanceAnalyticsView from "./AttendanceAnalyticsView";
import base64js from "base64-js";
import pako from "pako";
import ClearAllIcon from '@mui/icons-material/ClearAll';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';


const STATUSES = {};
const SHIFTS = {};
const allDepartments = new Set(["Site"]);
const allShifts = new Set();
const allTeams = new Set();

const decompress = (base64String) => {
  const compressedData = base64js.toByteArray(base64String);
  const decompressedData = pako.inflate(compressedData, { to: 'string' });
  return JSON.parse(decompressedData);
}

export default function AttendanceView() {
  const [employees, setEmployees] = useState([]);
  const [cachedData, setCachedData] = useState({});
  const [currentTopic, setCurrentTopic] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState("Site");
  const [shiftFilter, setShiftFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [searchQuery, setSearchQuery] = useState("");
  const [editingData, setEditingData] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [isDataEmpty, setIsDataEmpty] = useState(false);

  const stompClient = useRef(null);
  const subscriptionRef = useRef(null);

  const processAttendanceData = (data) => {
    const result = {};
    
    Object.entries(data).forEach(([key, attendanceListObject]) => {
      try {
        const { attendance, employee } = attendanceListObject;
        
        attendance.forEach(record => {
          const monthKey = dayjs(record.attendanceDate).format('YYYY-MM');
          if (!result[monthKey]) {
            result[monthKey] = [];
          }
          
          const existingEmployee = result[monthKey].find(emp => emp.info.id === employee.id);
          if (existingEmployee) {
            existingEmployee.attendanceList.push(record);
          } else {
            result[monthKey].push({
              info: employee,
              attendanceList: [record]
            });
          }
        });
        
        allDepartments.add(employee.departmentName);
        allShifts.add(employee.shiftName);
        allTeams.add(employee.teamName);
      } catch (error) {
        console.error("Error parsing employee key:", error);
      }
    });
    
    return result;
  };

  const handleSingleDayUpdate = (updates) => {
    const currentMonthKey = selectedMonth.format('YYYY-MM');
    
    setCachedData(prevCache => {
      const updatedCache = { ...prevCache };
      
      updates.forEach(update => {
        if (updatedCache[currentMonthKey]) {
          const employeeIndex = updatedCache[currentMonthKey].findIndex(
            emp => emp.info.id === update.employeeId
          );
          
          if (employeeIndex !== -1) {
            const updatedAttendanceList = [...updatedCache[currentMonthKey][employeeIndex].attendanceList];
            const dayIndex = update.dayIndex;
            
            if (dayIndex >= 0 && dayIndex < updatedAttendanceList.length) {
              updatedAttendanceList[dayIndex] = {
                ...updatedAttendanceList[dayIndex],
                attendanceId: update.attendanceId,
                attendanceDate: update.attendanceDate,
                shiftCode: update.shiftCode,
                statusCode: update.statusCode,                
                houseWorked: update.houseWorked
              };
              updatedCache[currentMonthKey][employeeIndex] = {
                ...updatedCache[currentMonthKey][employeeIndex],
                attendanceList: updatedAttendanceList
              };
            }
          }
        }
      });
      
      return updatedCache;
    });

    setEmployees(prevEmployees => {
      return cachedData[currentMonthKey] || prevEmployees;
    });
  };

  const subscribeToTopic = (startDate, endDate) => {
    const topic = `/topic/attendanceList/${startDate}_${endDate}`;
    
    if (topic === currentTopic) return;
    
    setCurrentTopic(topic);
    
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    setCachedData({});
    setEmployees([]);
    setIsDataEmpty(false);
    setDepartmentFilter("Site");
    setShiftFilter("All");
    setTeamFilter("All");
    setSearchQuery("");
    setSelectedEmployees(new Set());

    subscriptionRef.current = stompClient.current.subscribe(topic, (message) => {
      const rawData = decompress(message.body);
      
      if (Array.isArray(rawData)) {
        if (rawData.length === 0) {
          setEmployees([]);
          setIsDataEmpty(true);
          return;
        }
        
        if (rawData[0]?.employee && rawData[0]?.attendance) {
          const processedData = processAttendanceData(rawData);
          const currentMonthKey = selectedMonth.format('YYYY-MM');
          
          setCachedData(prevCache => ({
            ...prevCache,
            ...processedData
          }));

          if (processedData[currentMonthKey] && currentMonthKey === selectedMonth.format('YYYY-MM')) {
            setEmployees(processedData[currentMonthKey]);
            setIsDataEmpty(false);
          }
        } else {
          handleSingleDayUpdate(rawData);
        }
      } else if (rawData.employeeId && rawData.attendanceDate) {
        const monthKey = dayjs(rawData.attendanceDate).format('YYYY-MM');
        
        setCachedData(prevCache => {
          const updatedCache = { ...prevCache };
          
          if (updatedCache[monthKey]) {
            const employeeIndex = updatedCache[monthKey].findIndex(
              emp => emp.info.id === rawData.employeeId
            );
            
            if (employeeIndex !== -1) {
              const updatedAttendanceList = [...updatedCache[monthKey][employeeIndex].attendanceList];

              const findIndex = updatedAttendanceList.findIndex(day => day.attendanceDate === rawData.attendanceDate);
              
              if (findIndex >= 0 && findIndex < updatedAttendanceList.length) {
                updatedAttendanceList[findIndex] = {
                  ...updatedAttendanceList[findIndex],
                  attendanceId: rawData.attendanceId,
                  attendanceDate: rawData.attendanceDate,
                  shiftCode: rawData.shiftCode,
                  statusCode: rawData.statusCode,
                  houseWorked: rawData.houseWorked
                };

                updatedCache[monthKey][employeeIndex] = {
                  ...updatedCache[monthKey][employeeIndex],
                  attendanceList: updatedAttendanceList
                };
              }
            }
          }
          
          return updatedCache;
        });

        if (monthKey === selectedMonth.format('YYYY-MM')) {
          setEmployees(prevEmployees => {
            return cachedData[monthKey] || prevEmployees;
          });
        }
      }
    });
  };

  const getDateRange = (selectedMonth) => {
    const previousMonthStart = selectedMonth.subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
    const currentMonthEnd = selectedMonth.endOf('month').format('YYYY-MM-DD');
    
    return { 
      startDate: previousMonthStart, 
      endDate: currentMonthEnd 
    };
  };

  const sendAttendanceRequest = (startDate, endDate) => {
    const requestData = {
      expertis: null,
      startDate,
      endDate,
    };
    stompClient.current.publish({
      destination: "/app/getAttendanceList",
      body: JSON.stringify(requestData),
    });
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axiosInstance.get("attendance/attendanceStatus");
        res.data.attendanceStatus.forEach((eachStatus) => {
          STATUSES[eachStatus.statusCode] = {
            name: eachStatus.statusName,
            color: eachStatus.color,
            id: eachStatus.id,
          };
        });
        res.data.shiftTimeWork.forEach((eachShift) => {
          SHIFTS[eachShift.shiftName] = {
            name: eachShift.shiftName,
            id: eachShift.shiftId,
            startTime: eachShift.startTime,
            endTime: eachShift.endTime,
            shiftCode: eachShift.shiftCode,
          };
        });
      } catch (err) {
        console.error(err);
      } 
    };
    fetchConfig();
    stompClient.current = new Client({
      webSocketFactory: () =>
        new SockJS(`${BASE_URL}/attendance`, null, { xhrWithCredentials: true }),
      reconnectDelay: 5000,
      onConnect: (frame) => {
        const {startDate, endDate} = getDateRange(selectedMonth);
        subscribeToTopic(startDate, endDate);
        sendAttendanceRequest(startDate, endDate);
        setCurrentTopic(`${startDate}_${endDate}`);
      },
      onStompError: (frame) => {
      },
      onWebSocketClose: (event) => {
      },
      onWebSocketError: (error) => {
      },
    });
    stompClient.current.activate();
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, []);

  useEffect(() => {
    const currentMonthKey = selectedMonth.format('YYYY-MM');
    const dateRange = getDateRange(selectedMonth);
        
    if (cachedData[currentMonthKey]) {
      const monthData = cachedData[currentMonthKey];
      if (monthData && monthData.length > 0) {
        setEmployees(monthData);
        setIsDataEmpty(false);
      } else {
        setEmployees([]);
        setIsDataEmpty(true);
      }
      
    } else {
      if (stompClient.current?.connected) {
        subscribeToTopic(dateRange.startDate, dateRange.endDate);
        sendAttendanceRequest(dateRange.startDate, dateRange.endDate);
      }
    }
  }, [selectedMonth]);

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, []);

  const daysInMonth = selectedMonth.daysInMonth();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const filteredEmployees = employees.filter(({ info }) =>
    (departmentFilter === "Site" || info.departmentName === departmentFilter) &&
    (shiftFilter === "All" || info.shiftName === shiftFilter) &&
    (teamFilter === "All" || info.teamName === teamFilter) &&
    (searchQuery === "" ||
      `${info.firstName} ${info.lastName} ${info.expertis}`.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const gridTemplate = `320px repeat(${daysInMonth}, 1fr)`;

  const handleCellClick = (empInfo, colIndex, attendanceForDay) => {
    setEditingData({
      empId: empInfo.id,
      dayIndex: colIndex,
      attendanceId : attendanceForDay ? attendanceForDay.attendanceId : '',
      attendanceDate: attendanceForDay ? attendanceForDay.attendanceDate : '',
      status: attendanceForDay ? attendanceForDay.statusCode : "",
      hours: attendanceForDay ? attendanceForDay.houseWorked : 0,
      shift: attendanceForDay ? attendanceForDay.shiftCode : "",
      comment: attendanceForDay ? attendanceForDay.comment : "",
      currentActivity: attendanceForDay ? STATUSES[attendanceForDay.statusCode]?.name : "Unknown",
      assignedShift: attendanceForDay ? SHIFTS[attendanceForDay.shiftCode]?.name : "Unknown",
      departmentName: attendanceForDay ? attendanceForDay.departmentName : "Unknown",
    });
  };

  const isWeekend = (day) => {
    const date = selectedMonth.date(day);
    return date.day() === 0 || date.day() === 6;
  };
  

  const handleEmployeeClick = (employeeId) => {
    setSelectedEmployees(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(employeeId)) {
        newSelected.delete(employeeId);
      } else {
        newSelected.add(employeeId);
      }
      return newSelected;
    });
  };

  const handleSave = (empId, dayIndex, updatedData, shouldApplyToSelected = false) => {
    const employeesToUpdate = shouldApplyToSelected ? 
      [...selectedEmployees] : 
      [empId];

    if (employeesToUpdate.length === 1) {
      const employeeData = employees.find(emp => emp.info.id === empId);
      const attendanceForDay = employeeData?.attendanceList[dayIndex];

      const updatedObject = {
        attendanceId: updatedData.attendanceId,
        dayIndex: dayIndex,
        employeeId: employeesToUpdate[0],
        departmentName: attendanceForDay?.departmentName,
        attendanceDate: new Date(updatedData.attendanceDate).toISOString().split('T')[0],
        statusCode: updatedData.status,
        houseWorked: updatedData.hours == '' ? 0 : updatedData.hours,
        shiftCode: updatedData.shift,
        comment: updatedData.comment ? updatedData.comment : '',
        topicDate: currentTopic
      };

      stompClient.current.publish({
        destination: "/app/updateAttendanceDay",
        body: JSON.stringify(updatedObject)
      });
    } else {
      const bulkUpdateObject = employeesToUpdate.map((employeeId) => {
        const employeeData = employees.find(emp => emp.info.id === employeeId);
        const attendanceForDay = employeeData?.attendanceList[dayIndex];

        return {
          attendanceId: attendanceForDay?.attendanceId || '',
          dayIndex: dayIndex,
          employeeId: employeeId,
          departmentName: attendanceForDay?.departmentName,
          attendanceDate: new Date(updatedData.attendanceDate).toISOString().split('T')[0],
          statusCode: updatedData.status,
          houseWorked: updatedData.hours == '' ? 0 : updatedData.hours,
          shiftCode: updatedData.shift,
          comment: updatedData.comment ? updatedData.comment : '',
          topicDate: currentTopic
        };
      });

      stompClient.current.publish({
        destination: "/app/updateAttendanceDayBulk",
        body: JSON.stringify(bulkUpdateObject)
      });
    }
  };

  const handleViewChange = (event, newValue) => {
    setViewMode(newValue);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "#F5F5F5", p: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={viewMode} onChange={handleViewChange}>
          <Tab label="Table View" value="table" />
          <Tab label="Analytics" value="analytics" />
        </Tabs>
      </Box>

      {viewMode === 'table' ? (
        <>
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            mb: 2 
          }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <StyledDatePicker
                label="Select Month"
                value={selectedMonth}
                onChange={(newValue) => setSelectedMonth(newValue)}
                views={["year", "month"]}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { width: 200 },
                  },
                }}
              />
            </LocalizationProvider>

            <TextField
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              label="Search Employees"
              variant="outlined"
              size="small"
              sx={{ 
                bgcolor: "#FFF",
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />
          </Box>

          <FilterGroup>
            <FilterGroupTitle>Filters</FilterGroupTitle>
            <FilterGroupContent>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Department</InputLabel>
                <StyledMuiSelect
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="Department"
                >
                  {[...allDepartments.values()].map((dep) => (
                    <MenuItem key={dep} value={dep}>
                      {dep}
                    </MenuItem>
                  ))}
                </StyledMuiSelect>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Shift</InputLabel>
                <StyledMuiSelect
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value)}
                  label="Shift"
                >
                  <MenuItem value="All">All Shifts</MenuItem>
                  {[...allShifts.values()].map((shift) => (
                    <MenuItem key={shift} value={shift}>
                      {shift}
                    </MenuItem>
                  ))}
                </StyledMuiSelect>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Teams</InputLabel>
                <StyledMuiSelect
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  label="Team"
                >
                  <MenuItem value="All">All Teams</MenuItem>
                  {[...allTeams.values()].map((team) => (
                    <MenuItem key={team} value={team}>
                      {team}
                    </MenuItem>
                  ))}
                </StyledMuiSelect>
              </FormControl>
            </FilterGroupContent>
          </FilterGroup>

          <Box sx={{ 
            flex: 1, 
            overflow: "auto", 
            height: "calc(100vh - 200px)", 
            position: "relative"
          }}>
            {isDataEmpty ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Data Available
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  There are no attendance records for the selected month.
                </Typography>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: gridTemplate,
                    gap: "1px",
                    bgcolor: "#E0E0E0",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    width: "100%"
                  }}
                >
                  <Box 
                    sx={{ 
                      bgcolor: "#FFF", 
                      p: 1, 
                      borderBottom: "1px solid #E0E0E0",
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      fontWeight: "bold",
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2
                    }}
                  >
                    <Typography>Employee</Typography>
                    {selectedEmployees.size > 0 && (
                      <IconButton 
                        size="small" 
                        onClick={() => setSelectedEmployees(new Set())}
                        title="Clear selection"
                      >
                        <ClearAllIcon />
                      </IconButton>
                    )}
                  </Box>
                  {daysArray.map((day) => (
                    <Box
                      key={day}
                      sx={{
                        bgcolor: isWeekend(day) ? 'rgba(0, 0, 0, 0.7)' : '#FFF',
                        p: 1,
                        textAlign: "center",
                        borderBottom: "1px solid #E0E0E0",
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        fontWeight: "bold",
                        color: isWeekend(day) ? '#FFF' : 'black',
                        height: "50px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {day}
                    </Box>
                  ))}
                </Box>
                <List
                  height={window.innerHeight - 250}
                  itemCount={filteredEmployees.length}
                  itemSize={70}
                  width="100%"
                  overscanCount={10}
                  outerElementType="div"
                  style={{ 
                    position: "absolute", 
                    top: 50,
                    overflow: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none"
                  }}
                  outerRef={(ref) => {
                    if (ref) {
                      ref.style.scrollbarWidth = "none";
                      ref.style.msOverflowStyle = "none";
                      ref.style.overflow = "auto";
                      ref.style.setProperty("scrollbar-width", "none");
                    }
                  }}
                >
                  {({ index, style }) => (
                    <AttendanceRow
                      style={style}
                      gridTemplate={gridTemplate}
                      employeeData={filteredEmployees[index]}
                      daysArray={daysArray}
                      STATUSES={STATUSES}
                      onCellClick={handleCellClick}
                      onEmployeeClick={handleEmployeeClick}
                      isSelected={selectedEmployees.has(filteredEmployees[index].info.id)}
                      dayjs={dayjs}
                    />
                  )}
                </List>
              </>
            )}
          </Box>
        </>
      ) : (
        <AttendanceAnalyticsView
          employees={filteredEmployees}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          departmentFilter={departmentFilter}
          setDepartmentFilter={setDepartmentFilter}
        />
      )}

      {editingData && (
        <ShiftInfoDialog
          open={Boolean(editingData)}
          onClose={() => setEditingData(null)}
          editingData={editingData}
          onSave={(updatedData, applyToSelected) =>
            handleSave(editingData.empId, editingData.dayIndex, updatedData, applyToSelected)
          }
          STATUSES={STATUSES}
          SHIFTS={SHIFTS}
          hasSelectedEmployees={selectedEmployees.size > 1}
        />
      )}
    </Box>
  );
}