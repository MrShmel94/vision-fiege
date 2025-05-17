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
    Tooltip,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axiosInstance from "../../axiosInstance";
import dayjs from "dayjs";
import ShiftInfoDialog from "./ShiftInfoDialog";
import Swal from "sweetalert2";

let daysArray = null;
let daysInMonth = null;

export default function TemplateCreator() {
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [templateName, setTemplateName] = useState("");
    const [templateComment, setTemplateComment] = useState("");
    const [schedule, setSchedule] = useState({});
    const [STATUSES, setSTATUSES] = useState({});
    const [SHIFTS, setSHIFTS] = useState({});
    const [tempMonth, setTempMonth] = useState(null);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [editingDay, setEditingDay] = useState(null);
    const [existingTemplates, setExistingTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState("");

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await axiosInstance.get("attendance/attendanceStatus");
                const statuses = {};
                res.data.attendanceStatus.forEach((eachStatus) => {
                    statuses[eachStatus.statusCode] = {
                        name: eachStatus.statusName,
                        color: eachStatus.color,
                        id: eachStatus.id,
                    };
                });
                setSTATUSES(statuses);

                const shifts = {};
                res.data.shiftTimeWork.forEach((eachShift) => {
                    shifts[eachShift.shiftName] = {
                        name: eachShift.shiftName,
                        id: eachShift.shiftId,
                        startTime: eachShift.startTime,
                        endTime: eachShift.endTime,
                        shiftCode: eachShift.shiftCode,
                    };
                });
                setSHIFTS(shifts);
            } catch (err) {
                console.error("Error loading configuration:", err);
            } finally {
                setLoadingConfig(false);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        if (selectedMonth) {
            const fetchTemplates = async () => {
                try {
                    const res = await axiosInstance.get(`/attendance/getScheduleByDate?date=${selectedMonth.format("YYYY-MM-DD")}`);
                    setExistingTemplates(res.data);
                } catch (err) {
                    console.error("Error loading templates:", err);
                }
            };
            fetchTemplates();
        }
    }, [selectedMonth]);

    useEffect(() => {
        if (selectedMonth) {
            const daysInMonth = selectedMonth.daysInMonth();
            const initialSchedule = {};
            for (let day = 1; day <= daysInMonth; day++) {
                initialSchedule[day] = { statusCode: "", shiftCode: "", hours: "", comment: "" };
            }
            setSchedule(initialSchedule);
        }
    }, [selectedMonth]);

    const handleMonthChange = (newValue) => {
        const hasData = Object.values(schedule).some(
            (day) => day.statusCode !== "" || day.shiftCode !== ""
        );
        if (hasData) {
            Swal.fire({
                title: "Clear template?",
                text: "Changing the month will clear the current template data.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, clear!",
                cancelButtonText: "No, keep",
            }).then((result) => {
                if (result.isConfirmed) {
                    setSchedule({});
                    setSelectedMonth(newValue);
                }
            });
        } else {
            setSelectedMonth(newValue);
        }
    };

    const checkTemplateName = () => {
        //TODO
    };

    const loadTemplate = (templateId) => {
        const template = existingTemplates.find((t) => t.id === templateId);
        if (template) {
            setTemplateName(template.nameScheduleTemplate);
            setTemplateComment(template.comment);
            setSchedule(template.schedule);
        }
    };

    const isCellComplete = (dayData) => {
        console.log("DAY DATA", dayData);
        return (dayData.statusCode !== undefined && dayData.statusCode !== null) && dayData.shiftCode;
    };

    const handleCellClick = (day) => {
        setEditingDay(day);
    };

    const handleSave = (day, data) => {
        setSchedule((prev) => ({
            ...prev,
            [day]: {
                statusCode: data.status,
                shiftCode: SHIFTS[data.shift].shiftCode
            },
        }));
        setEditingDay(null);
    };

    const handleTemplateSave = () => {
        console.log("Schedule -> ", schedule);
        if (!templateName) {
            Swal.fire({
                title: "Missing template name",
                text: "Please enter a name for the template.",
                icon: "warning",
            });
            return;
        }

        const incompleteDays = Object.entries(schedule)
            .filter(([_, dayData]) => !isCellComplete(dayData))
            .map(([day]) => day);

        if (incompleteDays.length > 0) {
            Swal.fire({
                title: "Incomplete template",
                text: `Please fill in all cells with status and shift. Missing data for days: ${incompleteDays.join(", ")}`,
                icon: "warning",
            });
            return;
        }

        const templateData = {
            nameScheduleTemplate: templateName,
            description: templateComment,
            period: selectedMonth.format("MM-YYYY"),
            schedule,
        };

        axiosInstance
            .post("/attendance/scheduleTemplate", templateData)
            .then((response) => {
                Swal.fire({
                    title: "Success",
                    text: "Template successfully saved!",
                    icon: "success",
                });
            })
            .catch((error) => {
                console.error("Error saving template:", error);
                Swal.fire({
                    title: "Error",
                    text: "Failed to save the template.",
                    icon: "error",
                });
            });
    };

    const daysInMonth = selectedMonth ? selectedMonth.daysInMonth() : 0;
    const daysArray = selectedMonth ? Array.from({ length: daysInMonth }, (_, i) => i + 1) : [];

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
                    <Typography variant="h6">Template creation for {selectedMonth.format("MMMM YYYY")}</Typography>
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Tooltip title="Enter a name for the template.">
                            <TextField
                                label="Template Name"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                onBlur={checkTemplateName}
                                fullWidth
                            />
                        </Tooltip>
                        <Tooltip title="Provide a description for the template.">
                            <TextField
                                label="Comment"
                                value={templateComment}
                                onChange={(e) => setTemplateComment(e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                            />
                        </Tooltip>
                    </Box>

                    {existingTemplates.length > 0 && (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="template-select-label">Load Existing Template</InputLabel>
                            <Select
                                labelId="template-select-label"
                                value={selectedTemplateId}
                                label="Load Existing Template"
                                onChange={(e) => {
                                    setSelectedTemplateId(e.target.value);
                                    loadTemplate(e.target.value);
                                }}
                            >
                                {existingTemplates.map((template) => (
                                    <MenuItem key={template.id} value={template.id}>
                                        {template.nameScheduleTemplate}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: `210px repeat(${daysInMonth}, 1fr)`,
                            gap: "1px",
                            bgcolor: "#E0E0E0",
                        }}
                    >
                        <Box sx={{ bgcolor: "#FFF", textAlign: "center",  p: 1, borderBottom: "1px solid #E0E0E0" }}>
                            Days
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
                        <Box
                            sx={{
                                bgcolor: "#FFF",
                                p: 1,
                                border: "1px solid #E0E0E0",
                                borderRadius: 1,
                                boxShadow: 1,
                                alignItems: "center",
                                textAlign: "center",
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.3,
                            }}
                        >
                            <Typography variant="subtitle1">
                                Template for {selectedMonth.format("MMMM YYYY")}
                            </Typography>
                        </Box>
                        {daysArray.map((day) => {
                            const dayData = schedule[day] || {};
                            console.log("DAY", day);
                            console.log("SCHEDULE", schedule);
                            console.log("DAY DATA IN TEMPLATE CREATOR", dayData);
                            const cellContent = dayData.statusCode || "";
                            const shiftSymbol = dayData.shiftCode ? dayData.shiftCode : "";
                            const isComplete = isCellComplete(dayData);
                            return (
                                <Box
                                    key={day}
                                    sx={{
                                        position: "relative",
                                        bgcolor: dayData.statusCode ? STATUSES[dayData.statusCode]?.color : "#FFF",
                                        p: 2,
                                        minHeight: 60,
                                        textAlign: "center",
                                        justifyContent: "center",
                                        display: "flex",
                                        alignItems: "center",
                                        borderBottom: "1px solid #E0E0E0",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: dayData.statusCode
                                            ? STATUSES[dayData.statusCode].color.toLowerCase() === "#000000"
                                                ? "#ffffff"
                                                : "#000000"
                                            : "#000",
                                        "&:hover": { bgcolor: "#F0F0F0" },
                                        border: isComplete ? "1px solid #E0E0E0" : "2px solid #ff0000",
                                        opacity: isComplete ? 1 : 0.7,
                                    }}
                                    onClick={() => handleCellClick(day)}
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
                                    {!isComplete && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                position: "absolute",
                                                bottom: 2,
                                                left: 0,
                                                right: 0,
                                                color: "#ff0000",
                                                fontSize: "0.7rem",
                                            }}
                                        >
                                            Incomplete
                                        </Typography>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>

                    <Button variant="contained" onClick={handleTemplateSave} sx={{ mt: 2, display: "block", mx: "auto" }}>
                        Save Template
                    </Button>
                </Paper>
            )}

            {editingDay && (
                <ShiftInfoDialog
                    open={Boolean(editingDay)}
                    onClose={() => setEditingDay(null)}
                    editingData={schedule[editingDay] || {}}
                    onSave={(data) => {
                        handleSave(editingDay, data);
                    }}
                    STATUSES={STATUSES}
                    SHIFTS={SHIFTS}
                    showPlannedInfo={false}
                    title={`Day ${editingDay}`}
                />
            )}
        </Box>
    );
}