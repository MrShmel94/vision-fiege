import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Select,
  MenuItem,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  Stack,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";

export default function ShiftInfoDialog({ open, onClose, editingData, onSave, STATUSES, SHIFTS, showPlannedInfo = true,
  title = `Shift Information : ${editingData?.date || ""}`,
  hasSelectedEmployees
}) {
  const [formData, setFormData] = useState({
    attendanceId: editingData?.attendanceId || '',
    attendanceDate: editingData?.attendanceDate || '',
    status: editingData?.status || '',
    hours: editingData?.hours || '',
    shift: editingData?.shift || '',
    comment: editingData?.comment || ''
  });
  const [applyToSelected, setApplyToSelected] = useState(false);
  const [errors, setErrors] = useState({});

  const handleCopy = useCallback(() => {
    const dataToCopy = { status: formData.status, shift: formData.shift, hours: formData.hours, comment: formData.comment };
    navigator.clipboard.writeText(JSON.stringify(dataToCopy));
  }, [formData.status, formData.shift, formData.hours, formData.comment]);

  const handlePaste = useCallback(async () => {
    try {
      const clipboardData = await navigator.clipboard.readText();
      const pastedData = JSON.parse(clipboardData);
      
      if (pastedData.status) setFormData(prev => ({ ...prev, status: pastedData.status }));
      if (pastedData.shift) setFormData(prev => ({ ...prev, shift: pastedData.shift }));
      if (pastedData.hours) setFormData(prev => ({ ...prev, hours: pastedData.hours }));
      if (pastedData.comment) setFormData(prev => ({ ...prev, comment: pastedData.comment }));
    } catch (error) {
      console.error("Failed to paste data:", error);
    }
  }, []);

  useEffect(() => {
    if (open && editingData) {
      setFormData({
        attendanceId: editingData.attendanceId || '',
        attendanceDate: editingData.attendanceDate || '',
        status: editingData.statusCode || '',
        hours: editingData.hours || '',
        shift: findShiftNameByCode(editingData.shiftCode) || '',
        comment: editingData.comment || ''
      });
      setErrors({});
    }
  }, [open, editingData]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!open) return;

      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        event.preventDefault();
        handleCopy();
      }
      
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        handlePaste();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleCopy, handlePaste]);

  const validateForm = () => {
    const newErrors = {};

    if (formData.status === undefined || formData.status === null) {
      newErrors.status = "Status is required";
    }
    
    if (!formData.shift) newErrors.shift = "Shift is required";
    if (formData.status === "Work" && !formData.hours) newErrors.hours = "Hours are required for work status";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    onSave(formData, applyToSelected);
    onClose();
  };

  const findShiftNameByCode = (code) => {
    return Object.entries(SHIFTS).find(([_, data]) => data.shiftCode === code)?.[0] || "";
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
        {title}
        <Box sx={{ position: "absolute", right: 8, top: 8, display: "flex", gap: 1 }}>
          <Tooltip title="Copy current settings">
            <IconButton onClick={handleCopy} size="small">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Paste settings">
            <IconButton onClick={handlePaste} size="small">
              <ContentPasteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {showPlannedInfo && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                Planned Activity: {editingData.currentActivity || "Not specified"}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                Planned Shift: {editingData.assignedShift || "Not assigned"}
              </Typography>
            </>
          )}
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              value={formData.status}
              label="Status"
              displayEmpty
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              renderValue={(selected) => {
                const selectedStatus = STATUSES[selected];
                return (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: selectedStatus?.color,
                      color: selectedStatus?.color.toLowerCase() === "#000000" ? "#ffffff" : "#000000",
                      borderRadius: 1,
                      p: 1,
                      fontWeight: "medium",
                    }}
                  >
                    {selected} - {selectedStatus?.name}
                  </Box>
                );
              }}
            >
              {Object.entries(STATUSES).map(([code, { name, color }]) => (
                <MenuItem
                  key={code}
                  value={code}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: color,
                    color: color.toLowerCase() === "#000000" ? "#ffffff" : "#000000",
                    textAlign: "center",
                    borderRadius: 1,
                    "&:hover": { backgroundColor: `${color}DD` },
                  }}
                >
                  {`${code} - ${name}`}
                </MenuItem>
              ))}
            </Select>
            {errors.status && <Typography color="error" variant="caption">{errors.status}</Typography>}
          </FormControl>
          {formData.status === "Work" && (
            <TextField
              fullWidth
              label="Hours Worked"
              type="number"
              value={formData.hours}
              onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
              error={!!errors.hours}
              helperText={errors.hours}
            />
          )}
          <FormControl fullWidth error={!!errors.shift}>
            <InputLabel id="shift-select-label">Shift</InputLabel>
            <Select
              labelId="shift-select-label"
              value={formData.shift}
              label="Shift"
              onChange={(e) => setFormData(prev => ({ ...prev, shift: e.target.value }))}
            >
              {Object.entries(SHIFTS).map(([code, { name, startTime, endTime }]) => (
                <MenuItem key={code} value={code}>
                  {name} ({startTime} - {endTime})
                </MenuItem>
              ))}
            </Select>
            {errors.shift && <Typography color="error" variant="caption">{errors.shift}</Typography>}
          </FormControl>
          <TextField
            fullWidth
            label="Comment"
            multiline
            rows={3}
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
          />
          {hasSelectedEmployees && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={applyToSelected}
                  onChange={(e) => setApplyToSelected(e.target.checked)}
                />
              }
              label="Apply to all selected employees"
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", p: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" sx={{ textTransform: "none" }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}