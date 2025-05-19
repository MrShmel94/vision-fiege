import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  MenuItem
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { 
  CardContainer, 
  Section, 
  SectionHeader, 
  SectionTitle, 
  Field, 
  FieldLabel, 
  StyledTextField, 
  StyledMuiSelect, 
  StyledDatePicker,
  reactSelectStyles
} from '../../styles/commonStyles';
import axiosInstance from '../../axiosInstance';
import dayjs from 'dayjs';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import LinkIcon from '@mui/icons-material/Link';
import CodeIcon from '@mui/icons-material/Code';
import { Tooltip, IconButton } from '@mui/material';
import { useAppContext } from '../../AppContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const steps = ['Basic Information', 'Document Details', 'Access Control'];

const PulseField = ({ children, isRequired, isError }) => {
  return (
    <motion.div
      animate={{
        scale: isRequired && isError ? [1, 1.02, 1] : 1,
        boxShadow: isRequired && isError 
          ? ['0 0 0 0 rgba(184, 33, 54, 0.4)', '0 0 0 10px rgba(184, 33, 54, 0)']
          : 'none'
      }}
      transition={{
        duration: 2,
        repeat: isRequired && isError ? Infinity : 0,
        ease: "easeInOut"
      }}
      style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      {children}
    </motion.div>
  );
};

const AddDocumentView = () => {
  const { setErrorOverlay, setCurrentView, initialData } = useAppContext();
  const [activeStep, setActiveStep] = useState(0);
  const [config, setConfig] = useState({
    departments: [],
    positions: [],
    typeDocuments: []
  });
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    typeDocument: '',
    url: '',
    version: 0,
    dateStart: null,
    dateFinish: null,
    departments: [],
    positions: [],
    positionsAssistance: [],
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axiosInstance.get('/etc/configDocument');
        setConfig(response.data);
        
        if (initialData?.isEdit) {
          setFormData({
            ...initialData,
            departments: initialData.departments,
            positions: initialData.positions,
            positionsAssistance: initialData.positionsAssistance
          });
        }
      } catch (error) {
        setErrorOverlay({
          open: true,
          title: "Error",
          message: "Failed to load document configuration"
        });
      }
    };

    fetchConfig();
  }, [setErrorOverlay, initialData]);

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0:
        if (!formData.name.trim()) {
          newErrors.name = 'Document name is required';
        }
        if (!formData.typeDocument) {
          newErrors.typeDocument = 'Document type is required';
        }
        break;
      
      case 1:

        if (!formData.dateStart) {
          newErrors.dateStart = 'Start date is required';
        }
        if (!formData.dateFinish) {
          newErrors.dateFinish = 'Finish date is required';
        }
        if (formData.dateStart && formData.dateFinish) {
          const startDate = dayjs(formData.dateStart);
          const finishDate = dayjs(formData.dateFinish);
          if (finishDate.isBefore(startDate)) {
            newErrors.dateFinish = 'Finish date must be after or equal to start date';
          }
        }
        break;
      
      case 2:
        if (formData.departments.length === 0) {
          newErrors.departments = 'At least one department is required';
        }
        if (formData.positions.length === 0) {
          newErrors.positions = 'At least one position is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date ? date.format('YYYY-MM-DD') : null
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleMultiSelectChange = (name, selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedOptions.map(option => option.label)
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all required fields correctly',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#B82136'
      });
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      setCurrentView('documents');
    } else {
      setActiveStep(prevStep => prevStep - 1);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      typeDocument: '',
      url: '',
      version: 0,
      dateStart: null,
      dateFinish: null,
      departments: [],
      positions: [],
      positionsAssistance: [],
    });
    setActiveStep(0);
    setErrors({});
  };

  const handleSubmit = async () => {
    try {
      if (initialData?.isEdit) {
        const completeData = {
          name: formData.name || '',
          description: formData.description || '',
          typeDocument: formData.typeDocument || '',
          url: formData.url || '',
          version: formData.version || 0,
          dateStart: formData.dateStart || null,
          dateFinish: formData.dateFinish || null,
          departments: formData.departments || [],
          positions: formData.positions || [],
          positionsAssistance: formData.positionsAssistance || []
        };
        
        await axiosInstance.put(`/etc/updateDocument/${initialData.id}`, completeData);
        setCurrentView('documents');
      } else {
        await axiosInstance.post('/etc/saveDocument', formData);
        resetForm();
      }
    } catch (error) {
      setErrorOverlay({
        open: true,
        title: "Error",
        message: initialData?.isEdit ? "Failed to update document" : "Failed to create document"
      });
    }
  };

  const isFieldRequired = (step, fieldName) => {
    switch (step) {
      case 0:
        return ['name', 'typeDocument'].includes(fieldName);
      case 1:
        return ['version', 'dateStart', 'dateFinish'].includes(fieldName);
      case 2:
        return ['departments', 'positions'].includes(fieldName);
      default:
        return false;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Section>
              <SectionHeader>
                <DescriptionIcon color="primary" />
                <SectionTitle>Document Information</SectionTitle>
              </SectionHeader>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Field sx={{ flex: 1 }}>
                    <FieldLabel>
                      Document Name
                      <Tooltip title="Enter a descriptive name for the document">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </FieldLabel>
                    <PulseField isRequired={isFieldRequired(0, 'name')} isError={!!errors.name}>
                      <StyledTextField
                        fullWidth
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Safety Protocol v2.0"
                        error={!!errors.name}
                        helperText={errors.name}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionIcon color={errors.name ? "error" : "action"} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </PulseField>
                  </Field>

                  <Field sx={{ flex: 1 }}>
                    <FieldLabel>
                      Document Type
                      <Tooltip title="Select the type of document">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </FieldLabel>
                    <PulseField isRequired={isFieldRequired(0, 'typeDocument')} isError={!!errors.typeDocument}>
                      <StyledMuiSelect
                        fullWidth
                        name="typeDocument"
                        value={formData.typeDocument}
                        onChange={handleInputChange}
                        required
                        error={!!errors.typeDocument}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              maxHeight: 300,
                              '& .MuiMenuItem-root': {
                                padding: '8px 16px',
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                  color: 'primary.contrastText',
                                },
                              },
                            },
                          },
                        }}
                      >
                        {config.typeDocuments.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </StyledMuiSelect>
                    </PulseField>
                  </Field>
                </Box>

                <Field>
                  <FieldLabel>
                    Description
                    <Tooltip title="Enter a comprehensive description">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </FieldLabel>
                  <StyledTextField
                    fullWidth
                    multiline
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of the document..."
                  />
                </Field>
              </Box>
            </Section>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Section>
              <SectionHeader>
                <CalendarTodayIcon color="primary" />
                <SectionTitle>Document Details</SectionTitle>
              </SectionHeader>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Field sx={{ flex: 1 }}>
                    <FieldLabel>
                      URL
                      <Tooltip title="Enter the document URL">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </FieldLabel>
                    <StyledTextField
                      fullWidth
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Field>

                  <Field sx={{ flex: 1 }}>
                    <FieldLabel>
                      Version
                      <Tooltip title="Enter the document version number">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </FieldLabel>
                    <PulseField isRequired={isFieldRequired(1, 'version')} isError={!!errors.version}>
                      <StyledTextField
                        fullWidth
                        type="number"
                        name="version"
                        value={formData.version}
                        onChange={handleInputChange}
                        required
                        error={!!errors.version}
                        helperText={errors.version}
                        inputProps={{
                          min: 0,
                          step: 1,
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CodeIcon color={errors.version ? "error" : "action"} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </PulseField>
                  </Field>
                </Box>

                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Field sx={{ flex: 1 }}>
                    <FieldLabel>
                      Start Date
                      <Tooltip title="Select the document start date">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </FieldLabel>
                    <PulseField isRequired={isFieldRequired(1, 'dateStart')} isError={!!errors.dateStart}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <StyledDatePicker
                          value={formData.dateStart ? dayjs(formData.dateStart) : null}
                          onChange={(date) => handleDateChange('dateStart', date)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.dateStart,
                              helperText: errors.dateStart,
                              InputProps: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarTodayIcon color={errors.dateStart ? "error" : "action"} />
                                  </InputAdornment>
                                ),
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </PulseField>
                  </Field>

                  <Field sx={{ flex: 1 }}>
                    <FieldLabel>
                      Finish Date
                      <Tooltip title="Select the document end date (optional)">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </FieldLabel>
                    <PulseField isRequired={isFieldRequired(1, 'dateFinish')} isError={!!errors.dateFinish}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <StyledDatePicker
                          value={formData.dateFinish ? dayjs(formData.dateFinish) : null}
                          onChange={(date) => handleDateChange('dateFinish', date)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.dateFinish,
                              helperText: errors.dateFinish,
                              InputProps: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarTodayIcon color={errors.dateFinish ? "error" : "action"} />
                                  </InputAdornment>
                                ),
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </PulseField>
                  </Field>
                </Box>
              </Box>
            </Section>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Section>
              <SectionHeader>
                <GroupIcon color="primary" />
                <SectionTitle>Access Control</SectionTitle>
              </SectionHeader>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Field>
                  <FieldLabel>
                    Departments
                    <Tooltip title="Select departments that should have access">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </FieldLabel>
                  <PulseField isRequired={isFieldRequired(2, 'departments')} isError={!!errors.departments}>
                    <Select
                      isMulti
                      name="departments"
                      options={config.departments.map((dept, index) => ({ 
                        value: `${dept}-${index}`, 
                        label: dept
                      }))}
                      value={formData.departments.map((dept, index) => ({ 
                        value: `${dept}-${index}`, 
                        label: dept
                      }))}
                      onChange={(selected) => handleMultiSelectChange('departments', selected)}
                      styles={reactSelectStyles}
                      placeholder="Select departments..."
                      isClearable
                      isSearchable
                      closeMenuOnSelect={false}
                      menuPortalTarget={document.body}
                      getOptionValue={option => option.value}
                      getOptionLabel={option => option.label}
                    />
                  </PulseField>
                </Field>

                <Field>
                  <FieldLabel>
                    Positions
                    <Tooltip title="Select positions that should have access">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </FieldLabel>
                  <PulseField isRequired={isFieldRequired(2, 'positions')} isError={!!errors.positions}>
                    <Select
                      isMulti
                      name="positions"
                      options={config.positions.map((pos, index) => ({ 
                        value: `pos-${pos}-${index}`, 
                        label: pos
                      }))}
                      value={formData.positions.map((pos, index) => ({ 
                        value: `pos-${pos}-${index}`, 
                        label: pos
                      }))}
                      onChange={(selected) => handleMultiSelectChange('positions', selected)}
                      styles={reactSelectStyles}
                      placeholder="Select positions..."
                      isClearable
                      isSearchable
                      closeMenuOnSelect={false}
                      menuPortalTarget={document.body}
                      getOptionValue={option => option.value}
                      getOptionLabel={option => option.label}
                    />
                  </PulseField>
                </Field>

                <Field>
                  <FieldLabel>
                    Positions Assistance
                    <Tooltip title="Select positions assistance that should have access">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </FieldLabel>
                  <Select
                    isMulti
                    name="positionsAssistance"
                    options={config.positions.map((pos, index) => ({ 
                      value: `assist-${pos}-${index}`, 
                      label: pos
                    }))}
                    value={formData.positionsAssistance.map((pos, index) => ({ 
                      value: `assist-${pos}-${index}`, 
                      label: pos
                    }))}
                    onChange={(selected) => handleMultiSelectChange('positionsAssistance', selected)}
                    styles={reactSelectStyles}
                    placeholder="Select positions assistance..."
                    isClearable
                    isSearchable
                    closeMenuOnSelect={false}
                    menuPortalTarget={document.body}
                    getOptionValue={option => option.value}
                    getOptionLabel={option => option.label}
                  />
                </Field>
              </Box>
            </Section>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <CardContainer>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            {initialData?.isEdit ? 'Edit Document' : 'Add New Document'}
          </Typography>
          {initialData?.isEdit && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Back to Documents
            </Button>
          )}
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box>
          <AnimatePresence mode="wait">
            {renderStepContent(activeStep)}
          </AnimatePresence>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 4,
            position: 'relative'
          }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              color="primary"
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Box sx={{ 
                position: 'absolute', 
                left: '50%', 
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
              }}>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<SaveIcon />}
                  sx={{
                    minWidth: 200,
                    height: 48,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 12px rgba(184, 33, 54, 0.2)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(184, 33, 54, 0.3)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Save Document
                </Button>
                <Typography variant="caption" color="text.secondary">
                  All required fields must be filled
                </Typography>
              </Box>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </CardContainer>
  );
};

export default AddDocumentView; 