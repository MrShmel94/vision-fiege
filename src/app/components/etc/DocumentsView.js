import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CardContainer, 
  Section, 
  SectionHeader, 
  SectionTitle, 
  StyledMuiSelect,
  StyledDatePicker,
  StyledTimePicker,
  reactSelectStyles
} from '../../styles/commonStyles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Select from 'react-select';
import axiosInstance from '../../axiosInstance';
import DescriptionIcon from '@mui/icons-material/Description';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EventIcon from '@mui/icons-material/Event';
import { format } from 'date-fns';
import { useAppContext } from '../../AppContext';
import { Field, FieldLabel, PulseField } from '../../styles/commonStyles';
import InfoIcon from '@mui/icons-material/Info';

const DocumentsView = () => {
  const { setIsLoading, setErrorOverlay, setCurrentView, setInitialData } = useAppContext();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [documents, setDocuments] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openTrainingDialog, setOpenTrainingDialog] = useState(false);
  const [config, setConfig] = useState({
    departments: [],
    positions: []
  });

  const [trainingData, setTrainingData] = useState({
    date: dayjs(),
    startTime: dayjs().set('hour', 9).set('minute', 0),
    endTime: dayjs().set('hour', 17).set('minute', 0),
    positions: [],
    trainers: '',
    description: '',
    place: '',
    documentName: '',
    isAutoTraining: false
  });

  const positionsOptions = useMemo(() => 
    config.positions.map((pos, index) => ({
      value: `pos-${pos}-${index}`,
      label: pos
    })), [config.positions]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get('/etc/departments');
        setDepartments(response.data);
      } catch (error) {
        setErrorOverlay({
          open: true,
          title: "Error",
          message: "Failed to fetch departments"
        });
      }
    };

    fetchDepartments();
  }, [setErrorOverlay]);

  useEffect(() => {
    if (selectedDepartment) {
      const fetchDocuments = async () => {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(`/etc?department=${encodeURIComponent(selectedDepartment)}`);
          setDocuments(response.data);
        } catch (error) {
          setErrorOverlay({
            open: true,
            title: "Error",
            message: "Failed to fetch documents"
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchDocuments();
    }
  }, [selectedDepartment, setIsLoading, setErrorOverlay]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axiosInstance.get('/etc/configDocument');
        setConfig(response.data);
      } catch (error) {
        setErrorOverlay({
          open: true,
          title: "Error",
          message: "Failed to load document configuration"
        });
      }
    };

    fetchConfig();
  }, [setErrorOverlay]);

  const handleMenuOpen = (event, document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDocument = () => {
    // TODO: Implement document viewing
    handleMenuClose();
  };

  const handleEditDocument = async () => {
    try {
      setInitialData({
        ...selectedDocument,
        isEdit: true
      });
      setCurrentView('addDocument');
    } catch (error) {
      setErrorOverlay({
        open: true,
        title: "Error",
        message: "Failed to load document configuration"
      });
    } finally {
      handleMenuClose();
    }
  };

  const handleDeleteDocument = () => {
    // TODO: Implement document deletion
    handleMenuClose();
  };

  const handleDownloadDocument = () => {
    // TODO: Implement document download
    handleMenuClose();
  };

  const handlePlanTraining = () => {
    setTrainingData(prev => ({
      ...prev,
      documentId: selectedDocument.id,
      documentName: selectedDocument.name
    }));
    setOpenTrainingDialog(true);
    setAnchorEl(null);
  };

  const handleTrainingDialogClose = () => {
    setOpenTrainingDialog(false);
    setTrainingData({
      date: dayjs(),
      startTime: dayjs().set('hour', 9).set('minute', 0),
      endTime: dayjs().set('hour', 17).set('minute', 0),
      positions: [],
      trainers: '',
      description: '',
      place: '',
      documentName: '',
      isAutoTraining: false
    });
  };

  const handleTrainingSubmit = async () => {
    setIsLoading(true);
    try {
      const formattedData = {
        documentId: trainingData.documentId,
        date: trainingData.date.format('YYYY-MM-DD'),
        startTime: trainingData.startTime.format('HH:mm'),
        endTime: trainingData.endTime.format('HH:mm'),
        positions: trainingData.positions,
        trainers: trainingData.trainers.split(',').map(t => t.trim()),
        description: trainingData.description,
        place: trainingData.place,
        isAutoTraining: trainingData.isAutoTraining,
        documentName: trainingData.documentName
      };

      await axiosInstance.post('/etc/savePlaningTraining', formattedData);
      handleTrainingDialogClose();
    } catch (error) {
      setErrorOverlay({
        open: true,
        title: "Error",
        message: "Failed to create training"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultiSelectChange = (name, selectedOptions) => {
    setTrainingData(prev => ({
      ...prev,
      [name]: selectedOptions ? selectedOptions.map(option => option.label) : []
    }));
  };

  const handleCheckboxChange = (event) => {
    setTrainingData(prev => ({
      ...prev,
      isAutoTraining: event.target.checked
    }));
  };

  return (
    <CardContainer>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Documents
        </Typography>

        <Section>
          <SectionHeader>
            <DescriptionIcon color="primary" />
            <SectionTitle>Select Department</SectionTitle>
          </SectionHeader>
          <Box sx={{ mt: 2 }}>
            <StyledMuiSelect
              fullWidth
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select a department
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.name}>
                  {dept.name}
                </MenuItem>
              ))}
            </StyledMuiSelect>
          </Box>
        </Section>

        <AnimatePresence mode="wait">
          {selectedDepartment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Section sx={{ mt: 3 }}>
                <SectionHeader>
                  <DescriptionIcon color="primary" />
                  <SectionTitle>Documents List</SectionTitle>
                </SectionHeader>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Version</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Dates</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow
                          key={doc.id}
                          hover
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <DescriptionIcon color="action" />
                              <Typography variant="body1">{doc.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{doc.typeDocument}</TableCell>
                          <TableCell>v{doc.version}</TableCell>
                          <TableCell>
                            <Chip
                              label={doc.isImportant ? 'Important' : 'Normal'}
                              color={doc.isImportant ? 'error' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {format(new Date(doc.dateStart), 'MMM d, yyyy')} -{' '}
                              {doc.dateFinish ? format(new Date(doc.dateFinish), 'MMM d, yyyy') : 'Present'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Actions">
                              <IconButton
                                onClick={(e) => handleMenuOpen(e, doc)}
                                size="small"
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <MenuItem onClick={handleViewDocument}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleEditDocument}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handlePlanTraining}>
            <ListItemIcon>
              <EventIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Plan Training</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDownloadDocument}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteDocument}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      <Dialog
        open={openTrainingDialog}
        onClose={handleTrainingDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '16px'
          }
        }}
      >
        <DialogTitle sx={{ color: 'primary.main', typography: 'h5' }}>
          Plan Training
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'rgba(0, 0, 0, 0.04)', 
              borderRadius: 1,
              textAlign: 'center'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: 'text.primary'
              }}>
                {selectedDocument?.name || ''}
              </Typography>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <StyledDatePicker
                label="Training Date"
                value={trainingData.date}
                onChange={(newValue) => setTrainingData(prev => ({ ...prev, date: newValue }))}
                sx={{ width: '100%' }}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <StyledTimePicker
                  label="Start Time"
                  value={trainingData.startTime}
                  onChange={(newValue) => setTrainingData(prev => ({ ...prev, startTime: newValue }))}
                  sx={{ flex: 1 }}
                />
                <StyledTimePicker
                  label="End Time"
                  value={trainingData.endTime}
                  onChange={(newValue) => setTrainingData(prev => ({ ...prev, endTime: newValue }))}
                  sx={{ flex: 1 }}
                />
              </Box>
            </LocalizationProvider>

            <TextField
              label="Place"
              value={trainingData.place}
              onChange={(e) => setTrainingData(prev => ({ ...prev, place: e.target.value }))}
              placeholder="Enter training location"
              fullWidth
            />

            <Field>
              <FieldLabel>
                Positions
                <Tooltip title="Select positions that should have access">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </FieldLabel>
                <Select
                  isMulti
                  name="positions"
                  options={config.positions.map((pos, index) => ({ 
                    value: `pos-${pos}-${index}`, 
                    label: pos
                  }))}
                  value={trainingData.positions.map((pos, index) => ({ 
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
            </Field>

            <TextField
              label="Trainers"
              value={trainingData.trainers}
              onChange={(e) => setTrainingData(prev => ({ ...prev, trainers: e.target.value }))}
              placeholder="Enter trainer names separated by commas"
              fullWidth
            />

            <TextField
              label="Description"
              value={trainingData.description}
              onChange={(e) => setTrainingData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={4}
              fullWidth
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={trainingData.isAutoTraining}
                  onChange={handleCheckboxChange}
                  sx={{
                    color: 'primary.main',
                    '&.Mui-checked': {
                      color: 'primary.main',
                    },
                    '& .MuiSvgIcon-root': {
                      fontSize: 28,
                    },
                  }}
                />
              }
              label={
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Enable Auto Training
                </Typography>
              }
              sx={{
                mt: 1,
                '& .MuiFormControlLabel-label': {
                  fontSize: '1rem',
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={handleTrainingDialogClose} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleTrainingSubmit} 
            variant="contained"
            disabled={!trainingData.date || !trainingData.startTime || !trainingData.endTime}
          >
            Create Training
          </Button>
        </DialogActions>
      </Dialog>
    </CardContainer>
  );
};

export default DocumentsView; 