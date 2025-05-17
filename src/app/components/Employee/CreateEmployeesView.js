"use client";

import React, { useState, useEffect } from "react";
import dayjs from 'dayjs';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    IconButton,
    Tabs,
    Tab,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid } from "@mui/x-data-grid";
import { useDropzone } from 'react-dropzone';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axiosInstance from "../../axiosInstance";
import "react-datepicker/dist/react-datepicker.css";
import { useNotification } from "../Global/GlobalNotification";

export function BeautifulDatePicker({ label, value, onChange }) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                label={label}
                value={value ? dayjs(value) : null}
                onChange={(newValue) => onChange(newValue ? newValue.toDate() : null)}
                renderInput={(params) => <TextField fullWidth {...params} />}
            />
        </LocalizationProvider>
    );
}

export default function CreateEmployeeForm() {
    const [formData, setFormData] = useState({
        expertis: "",
        brCode: "",
        firstName: "",
        lastName: "",
        sex: "",
        site: "",
        shift: "",
        department: "",
        team: "",
        country: "",
        position: "",
        agency: "",
        dateStartContract: null,
        dateFinishContract: null,
        note: "",
        fte: 1,
    });

    const [employeesBatch, setEmployeesBatch] = useState([]);
    const [tab, setTab] = useState(0);

    const [config, setConfig] = useState(null);
    const [loadingConfig, setLoadingConfig] = useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const { notify } = useNotification();

    const FileUpload = ({ onFileSelected }) => {
        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
          onDrop: acceptedFiles => {
            onFileSelected(acceptedFiles[0]);
          },
        });
      
        return (
          <Box {...getRootProps()} sx={{
            border: '2px dashed #1976d2',
            borderRadius: 2,
            padding: 4,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'rgba(25,118,210,0.1)' : 'transparent',
          }}>
            <input {...getInputProps()} />
            <Typography variant="body1">
              {isDragActive ? "Drop the file here..." : "Drag 'n' drop an XLSX file here, or click to select a file"}
            </Typography>
          </Box>
        );
      };

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await axiosInstance.get("employee/config");
                setConfig(res.data);
                console.log(res.data);

            } catch (err) {
                console.error(err);
                setError("Failed to load configuration.");
            } finally {
                setLoadingConfig(false);
            }
        };
        fetchConfig();

        console.log(config);
    }, []);

    const handleAddEmployee = () => {
        if (!formData.expertis || !formData.firstName || !formData.lastName || !formData.sex
            || !formData.department || !formData.shift
            || !formData.team || !formData.position
            || !formData.country || !formData.agency
            || !formData.dateStartContract
        ) {
            return;
        }
        setEmployeesBatch([
            ...employeesBatch,
            { 
              ...formData, 
              site: config.siteName,
              id: Date.now(),
              dateStartContract: formData.dateStartContract ? dayjs(formData.dateStartContract).format('YYYY-MM-DD') : null,
              dateFinishContract: formData.dateFinishContract ? dayjs(formData.dateFinishContract).format('YYYY-MM-DD') : null
            }
        ]);
        setFormData({ firstName: "", lastName: "", expertis: "", brCode: "", sex: "", department: "", shift: "", team: "", position: "", country: "", agency: "", dateStartContract: null, dateFinishContract: null, fte: 1 });
    };

    const sendBatch = async () => {
        
        try {

            const payload = employeesBatch.map(
                ({ id, brCode, ...rest }) => ({
                  ...rest,
                  ...(brCode && brCode.trim().length > 0 ? { brCode } : {}),
                })
              );

            const response = await axiosInstance.post("/employee/createEmployees", { employees: payload });
            
            if (response.data.failed > 0) {
                response.data.errorMessages.forEach(msg => notify(msg, "error"));
              } else {
                notify("Employees added successfully!", "success");
              }
      
          } catch (err) {
            console.error(err);
            setError("Failed to assign employees.");
          }
    }

    const handleDeleteEmployee = (id) => {
        setEmployeesBatch(employeesBatch.filter((emp) => emp.id !== id));
    };

    const columns = [
        { field: "expertis", headerName: "Expertis", flex: 1 },
        { field: "firstName", headerName: "First Name", flex: 1 },
        { field: "lastName", headerName: "Last Name", flex: 1 },
        { field: "sex", headerName: "Sex", flex: 1 },
        { field: "department", headerName: "Department", flex: 1 },
        { field: "shift", headerName: "Shift", flex: 1 },
        { field: "team", headerName: "Team", flex: 1 },
        { field: "position", headerName: "Position", flex: 1 },
        { field: "country", headerName: "Country", flex: 1 },
        { field: "agency", headerName: "Agency", flex: 1 },

        {
            field: "actions",
            headerName: "Actions",
            flex: 0.5,
            renderCell: (params) => (
                <IconButton onClick={() => handleDeleteEmployee(params.row.id)}>
                    <DeleteIcon />
                </IconButton>
            ),
        },
    ];

    return (
        <Box sx={{ p: 4, maxWidth: 1900, width: 1500, mx: "auto" }}>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Typography variant="h4" gutterBottom>Create Employees</Typography>
                    </Box>
            

            <Tabs
                value={tab}
                onChange={(e, val) => setTab(val)}
                centered
                sx={{
                    mb: 3,
                    ".MuiTab-root": {
                    fontSize: '1rem',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    },
                    ".Mui-selected": {
                    color: "#1976d2",
                    },
                    ".MuiTabs-indicator": {
                    backgroundColor: "#1976d2",
                    },
                }}
                >
                <Tab label="Manual Entry" />
                <Tab label="Upload XLSX" />
            </Tabs>
            {tab === 0 && (
                <><Paper sx={{ flex: 2, p: 3 }}>
                    <Typography variant="h6" gutterBottom>Employee Information</Typography>

                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <TextField
                            label="Expertis"
                            value={formData.expertis}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {  // разрешает ввод только цифр
                                setFormData({ ...formData, expertis: val });
                                }
                            }}
                            inputProps={{ minLength: 5, maxLength: 20 }}
                        />
                        <TextField label="BR Code" value={formData.brCode} onChange={(e) => setFormData({ ...formData, brCode: e.target.value })} />

                        <TextField label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                        <TextField label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />

                        <FormControl fullWidth>
                            <InputLabel>Sex</InputLabel>
                            <Select value={formData.sex} label="Sex" onChange={(e) => setFormData({ ...formData, sex: e.target.value })}>
                                <MenuItem value="M">Male</MenuItem>
                                <MenuItem value="F">Female</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Department</InputLabel>
                            <Select value={formData.department} label="Department" onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                                {config?.departments?.map((dp) => (
                                    <MenuItem key={dp.id} value={dp.name}>
                                        {dp.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Shift</InputLabel>
                            <Select value={formData.shift} label="Shift" onChange={(e) => setFormData({ ...formData, shift: e.target.value })}>
                                {config?.shifts?.map((dp) => (
                                    <MenuItem key={dp.id} value={dp.name}>
                                        {dp.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Team</InputLabel>
                            <Select value={formData.team} label="Team" onChange={(e) => setFormData({ ...formData, team: e.target.value })}>
                                {config?.teams?.map((dp) => (
                                    <MenuItem key={dp.id} value={dp.name}>
                                        {dp.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Position</InputLabel>
                            <Select value={formData.position} label="Position" onChange={(e) => setFormData({ ...formData, position: e.target.value })}>
                                {config?.positions?.map((dp) => (
                                    <MenuItem key={dp.id} value={dp.name}>
                                        {dp.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Country</InputLabel>
                            <Select value={formData.country} label="Country" onChange={(e) => setFormData({ ...formData, country: e.target.value })}>
                                {config?.countries?.map((dp) => (
                                    <MenuItem key={dp.id} value={dp.name}>
                                        {dp.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Agency</InputLabel>
                            <Select value={formData.agency} label="Agency" onChange={(e) => setFormData({ ...formData, agency: e.target.value })}>
                                {config?.agencies?.map((dp) => (
                                    <MenuItem key={dp.id} value={dp.name}>
                                        {dp.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField label="FTE" type="number" value={formData.fte} onChange={(e) => setFormData({ ...formData, fte: e.target.value })} />

                        <BeautifulDatePicker
                            label="Start Contract"
                            value={formData.dateStartContract}
                            onChange={(date) => setFormData({ ...formData, dateStartContract: date })} />

                        <BeautifulDatePicker
                            label="Finish Contract"
                            value={formData.dateFinishContract}
                            onChange={(date) => setFormData({ ...formData, dateFinishContract: date })} />

                    </Box>

                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleAddEmployee}>
                            Add to Batch
                        </Button>
                    </Box>
                </Paper>

                    <Paper sx={{ mt: 4, p: 2  }}>
                        <Typography variant="h6" gutterBottom>Employees Batch</Typography>
                        <DataGrid
                            rows={employeesBatch}
                            columns={columns}
                            autoHeight
                            disableSelectionOnClick
                            components={{ NoRowsOverlay: () => <Box sx={{ p: 2 }}>No employees added.</Box> }} />
                        <Button variant="contained" sx={{ mt: 2 }} fullWidth disabled={!employeesBatch.length} onClick={sendBatch}>Send Batch</Button>
                    </Paper></>
            )}

            {tab === 1 && (
            <Paper sx={{ p: 3, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                Upload Employees (XLSX)
                </Typography>
                <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                Required columns: <b>Expertis, First Name, Last Name, Sex, Department, Shift, Team, Position, Country, Agency, Date Start Contract, Date Finish Contract</b>.
                <br />
                Optional columns: <b>BR Code, Note, FTE</b>.
                </Typography>

                <FileUpload onFileSelected={(file) => {
                console.log(file);
                }} />

                <Button variant="contained" sx={{ mt: 2 }} fullWidth>
                Send XLSX
                </Button>
            </Paper>
            )}
        </Box>
    );
}
