import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import axiosInstance from '../../axiosInstance';
import { useAppContext } from '../../AppContext';
import { transformEmployeeData } from '../../utils/employeeDataTransform';
import { useConfiguration } from '../../hooks/useConfiguration';
import { format } from 'date-fns';
import {
  Section,
  SectionHeader,
  SectionTitle,
  FieldGrid,
  Field,
  FieldLabel,
  FieldValue,
  StyledTextField,
  ActionButton,
} from '../../styles/commonStyles';

const FIELD_TYPES = {
  TEXT: 'text',
  BOOLEAN: 'boolean',
  SELECT: 'select',
  DATE: 'date',
  DATETIME: 'datetime',
};

const DATE_FIELDS = [
  'dateStartContract',
  'dateFinishContract',
  'dateBhpNow',
  'dateBhpFuture',
  'dateAdrNow',
  'dateAdrFuture',
];

const DATETIME_FIELDS = [
  'validFromAccount',
  'validToAccount',
];

const SELECT_FIELDS = [
  'sex',
  'departmentName',
  'positionName',
  'shiftName',
  'countryName',
  'agencyName',
  'siteName',
  'teamName',
];

const EmployeeSection = ({ 
  icon: Icon, 
  title, 
  fields, 
  employee, 
  sectionKey,
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const { setErrorOverlay } = useAppContext();
  const { config, loadConfig } = useConfiguration();

  useEffect(() => {
    if (employee) {
      setEditedData(employee);
    }
  }, [employee]);

  const handleEditClick = async () => {
    if (sectionKey === 'work' && config.departmentName.length === 0) {
      await loadConfig();
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const transformedData = transformEmployeeData(editedData);
      console.log("TRANSFORMED DATA", transformedData);
      await axiosInstance.post(`employee/updateEmployee`, transformedData);
      onUpdate?.(transformedData);
      setIsEditing(false);
    } catch (error) {
      console.log("ERROR", error);
      setErrorOverlay({
        open: true,
        message: `Failed to update ${title.toLowerCase()}. Please try again.`,
      });
    }
  };

  const handleCancel = () => {
    setEditedData(employee);
    setIsEditing(false);
  };

  const handleDateChange = (field, newValue) => {

    if (!newValue) {
      setEditedData({ ...editedData, [field]: null });
      return;
    }
  
    const formattedValue = DATE_FIELDS.includes(field)
      ? format(new Date(newValue), 'yyyy-MM-dd')
      : format(newValue, "yyyy-MM-dd'T'HH:mm:ss");
  
    setEditedData({ ...editedData, [field]: formattedValue });
  };

  const getFieldType = (field) => {
    if (DATETIME_FIELDS.includes(field)) return FIELD_TYPES.DATETIME;
    if (DATE_FIELDS.includes(field)) return FIELD_TYPES.DATE;
    if (SELECT_FIELDS.includes(field) && Array.isArray(config[field])) return FIELD_TYPES.SELECT;
    if (employee && typeof employee[field] === 'boolean') return FIELD_TYPES.BOOLEAN;
    return FIELD_TYPES.TEXT;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const dateObj = new Date(dateString);
    return dateObj.toLocaleString().split('.')[0];
  };

  const renderField = (label, value, field) => {
    const fieldType = getFieldType(field);

    return (
      <Field key={field}>
        <FieldLabel>{label}</FieldLabel>
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {fieldType === FIELD_TYPES.BOOLEAN ? (
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedData[field]}
                      onChange={(e) => setEditedData({ ...editedData, [field]: e.target.checked })}
                    />
                  }
                  label={editedData[field] ? 'Yes' : 'No'}
                />
              ) : fieldType === FIELD_TYPES.SELECT ? (
                <FormControl fullWidth size="small">
                  <InputLabel>{label}</InputLabel>
                  <Select
                    value={editedData[field] || ''}
                    onChange={(e) => setEditedData({ ...editedData, [field]: e.target.value })}
                    label={label}
                  >
                    {Array.isArray(config[field]) && config[field].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : fieldType === FIELD_TYPES.DATETIME ? (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    value={editedData[field] ? new Date(editedData[field]) : null}
                    onChange={(newValue) => handleDateChange(field, newValue)}
                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                  />
                </LocalizationProvider>
              ) : fieldType === FIELD_TYPES.DATE ? (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={editedData[field] ? new Date(editedData[field]) : null}
                    onChange={(newValue) => handleDateChange(field, newValue)}
                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                  />
                </LocalizationProvider>
              ) : (
                <StyledTextField
                  fullWidth
                  size="small"
                  value={editedData[field] || ''}
                  onChange={(e) => setEditedData({ ...editedData, [field]: e.target.value })}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <FieldValue>
                {fieldType === FIELD_TYPES.BOOLEAN ? (value ? 'Yes' : 'No') : 
                 fieldType === FIELD_TYPES.DATETIME ? formatDateTime(value) :
                 fieldType === FIELD_TYPES.DATE ? formatDate(value) : 
                 value || '-'}
              </FieldValue>
            </motion.div>
          )}
        </AnimatePresence>
      </Field>
    );
  };

  if (!employee) return null;

  return (
    <Section>
      <SectionHeader sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon />
          <SectionTitle>{title}</SectionTitle>
        </Box>
        <Box sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ display: 'flex', gap: '8px' }}
              >
                <ActionButton 
                  onClick={handleSave} 
                  color="primary"
                >
                  <SaveIcon />
                </ActionButton>
                <ActionButton 
                  onClick={handleCancel} 
                  color="error"
                >
                  <CancelIcon />
                </ActionButton>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <ActionButton 
                  onClick={handleEditClick} 
                  color="primary"
                >
                  <EditIcon />
                </ActionButton>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </SectionHeader>
      <FieldGrid>
        {fields.map(({ label, field }) => renderField(label, employee[field], field))}
      </FieldGrid>
    </Section>
  );
};

export default EmployeeSection; 