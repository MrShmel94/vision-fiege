import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { StyledDatePicker, StyledMuiSelect, FilterGroup, FilterGroupTitle, FilterGroupContent } from "../../styles/commonStyles";
import dayjs from "dayjs";
import { useNotification } from "../Global/GlobalNotification";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AttendanceAnalyticsView = ({ employees, selectedMonth, setSelectedMonth, departmentFilter, setDepartmentFilter }) => {
  const { notify } = useNotification();
  const [timePeriod, setTimePeriod] = useState('week');
  const [chartType, setChartType] = useState('status');

  // Агрегация данных для графиков
  const aggregatedData = useMemo(() => {
    if (!employees.length) return [];

    const data = {};
    employees.forEach(emp => {
      emp.attendanceList.forEach(record => {
        const date = dayjs(record.attendanceDate);
        const key = timePeriod === 'week' 
          ? date.startOf('week').format('YYYY-MM-DD')
          : date.format('YYYY-MM-DD');

        if (!data[key]) {
          data[key] = {
            date: key,
            sick: 0,
            vacation: 0,
            work: 0,
            other: 0
          };
        }

        switch(record.statusCode) {
          case 'SICK':
            data[key].sick++;
            break;
          case 'VACATION':
            data[key].vacation++;
            break;
          case 'WORK':
            data[key].work++;
            break;
          default:
            data[key].other++;
        }
      });
    });

    return Object.values(data).sort((a, b) => a.date.localeCompare(b.date));
  }, [employees, timePeriod]);

  // Данные для круговой диаграммы
  const pieChartData = useMemo(() => {
    const totals = {
      sick: 0,
      vacation: 0,
      work: 0,
      other: 0
    };

    aggregatedData.forEach(record => {
      totals.sick += record.sick;
      totals.vacation += record.vacation;
      totals.work += record.work;
      totals.other += record.other;
    });

    return [
      { name: 'Sick', value: totals.sick },
      { name: 'Vacation', value: totals.vacation },
      { name: 'Work', value: totals.work },
      { name: 'Other', value: totals.other }
    ];
  }, [aggregatedData]);

  return (
    <Box sx={{ p: 3 }}>
      <FilterGroup>
        <FilterGroupTitle>Analytics Filters</FilterGroupTitle>
        <FilterGroupContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StyledDatePicker
              label="Select Month"
              value={selectedMonth}
              onChange={setSelectedMonth}
              views={["year", "month"]}
            />
          </LocalizationProvider>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Department</InputLabel>
            <StyledMuiSelect
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              label="Department"
            >
              <MenuItem value="All">All Departments</MenuItem>
              <MenuItem value="Site">Site</MenuItem>
            </StyledMuiSelect>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Time Period</InputLabel>
            <StyledMuiSelect
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              label="Time Period"
            >
              <MenuItem value="day">Daily</MenuItem>
              <MenuItem value="week">Weekly</MenuItem>
            </StyledMuiSelect>
          </FormControl>
        </FilterGroupContent>
      </FilterGroup>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Attendance Trends
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sick" name="Sick" fill="#FF8042" />
                <Bar dataKey="vacation" name="Vacation" fill="#00C49F" />
                <Bar dataKey="work" name="Work" fill="#0088FE" />
                <Bar dataKey="other" name="Other" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttendanceAnalyticsView;
