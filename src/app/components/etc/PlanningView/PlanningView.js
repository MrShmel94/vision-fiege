import React, { useState, useEffect } from 'react';
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
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CardContainer, 
  Section, 
  SectionHeader, 
  SectionTitle, 
  StyledDatePicker,
  PageHeader,
  PageHeaderTitle,
  PageHeaderSubtitle,
} from '../../../styles/commonStyles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import EventIcon from '@mui/icons-material/Event';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import axiosInstance from '../../../axiosInstance';
import { useAppContext } from '../../../AppContext';
import Swal from 'sweetalert2';
import AddParticipantsDialog from './AddParticipantsDialog';
import TrainingParticipantsDialog from './TrainingParticipantsDialog';

const PlanningView = () => {
  const { setIsLoading, setErrorOverlay } = useAppContext();
  const [trainings, setTrainings] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [shouldOpenDialog, setShouldOpenDialog] = useState(false);
  const [selectedTrainingParticipants, setSelectedTrainingParticipants] = useState(null);
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
  const [shouldOpenParticipantsDialog, setShouldOpenParticipantsDialog] = useState(false);

  const fetchTrainings = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/etc/getAllActivePlaning', {
        params: {
          start: startDate.format('YYYY-MM-DD'),
          end: endDate.format('YYYY-MM-DD')
        }
      });

      console.log("Trainings", response.data);

      setTrainings(response.data);
    } catch (error) {
      setErrorOverlay({
        open: true,
        title: "Error",
        message: "Failed to fetch trainings"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuOpen = (event, training) => {
    setAnchorEl(event.currentTarget);
    setSelectedTraining(training);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddParticipants = () => {
    setShouldOpenDialog(true);
    handleMenuClose();
  };

  useEffect(() => {
    if (shouldOpenDialog && selectedTraining) {
      setOpenDialog(true);
      setShouldOpenDialog(false);
    }
  }, [shouldOpenDialog, selectedTraining]);

  const handleEditTraining = () => {
    handleMenuClose();
  };

  const handleDeleteTraining = async (training) => {
    const result = await Swal.fire({
      title: "Delete Training?",
      text: "This will delete the training. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete training",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.get("/etc/deleteTraining", {
          params: {
            id: training.id,
          }
        });

        Swal.fire("Success", "Training has been deleted", "success");

        setTrainings(trainings.filter(t => t.id !== training.id));

      } catch (error) {
        Swal.fire("Error", "Failed to delete training", "error");
      }
    }

    handleMenuClose();
  };

  const getProgressColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return '#d32f2f';
    if (percentage >= 70) return '#ed6c02';
    return '#2e7d32';
  };

  const groupPositions = (positions) => {
    const groups = {};
    positions.forEach(position => {
      const firstChar = position[0];
      if (!groups[firstChar]) {
        groups[firstChar] = [];
      }
      groups[firstChar].push(position);
    });
    return groups;
  };

  const handleRowClick = (training) => {
    setSelectedTrainingParticipants(training);
    setShouldOpenParticipantsDialog(true);
  };

  useEffect(() => {
    if (shouldOpenParticipantsDialog && selectedTrainingParticipants) {
      setParticipantsDialogOpen(true);
      setShouldOpenParticipantsDialog(false);
    }
  }, [shouldOpenParticipantsDialog, selectedTrainingParticipants]);

  const handleCloseParticipantsDialog = () => {
    setParticipantsDialogOpen(false);
    setSelectedTrainingParticipants(null);
  };

  return (
    <CardContainer>
      <Box sx={{ p: 3 }}>
        <PageHeader>
          <PageHeaderTitle>Training Planning</PageHeaderTitle>
          <PageHeaderSubtitle>
            Manage and monitor your training sessions efficiently
          </PageHeaderSubtitle>
        </PageHeader>

        <Section>
          <SectionHeader>
            <EventIcon color="primary" />
            <SectionTitle>Date Range</SectionTitle>
          </SectionHeader>
          <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <StyledDatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                sx={{ width: 200 }}
              />
              <StyledDatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                sx={{ width: 200 }}
              />
            </LocalizationProvider>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={fetchTrainings}
              sx={{
                height: 56,
                borderRadius: '12px',
                px: 3,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Load Data
            </Button>
          </Box>
        </Section>

        <Section sx={{ mt: 3 }}>
          <SectionHeader>
            <EventIcon color="primary" />
            <SectionTitle>Planned Trainings</SectionTitle>
          </SectionHeader>
          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: '16px', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Training Details</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Schedule</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Positions</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Trainers</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Location</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Participants</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trainings.map((training) => {
                  const positionGroups = groupPositions(training.positions);
                  return (
                    <TableRow
                      key={training.id}
                      hover
                      onClick={() => handleRowClick(training)}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          transform: 'scale(1.01)'
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {training.documentName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Created by: {training.fullNameCreator}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2">
                            {dayjs(training.date).format('DD.MM.YYYY')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {training.timeStart} - {training.timeFinish}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {Object.entries(positionGroups).map(([group, positions]) => (
                            <Box key={`group-${group}`} sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {positions.map((position, index) => (
                                <Chip
                                  key={`${group}-${position}-${index}`}
                                  label={position}
                                  size="small"
                                  icon={<WorkIcon />}
                                  sx={{
                                    backgroundColor: 'primary.light',
                                    color: 'white',
                                    '& .MuiChip-icon': { color: 'white' }
                                  }}
                                />
                              ))}
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {training.nameTrainers.map((trainer, index) => (
                            trainer && (
                              <Chip
                                key={`trainer-${trainer}-${index}`}
                                label={trainer}
                                size="small"
                                icon={<PersonIcon />}
                                sx={{
                                  backgroundColor: 'secondary.light',
                                  color: 'white',
                                  '& .MuiChip-icon': { color: 'white' }
                                }}
                              />
                            )
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon color="primary" fontSize="small" />
                          <Typography variant="body2">{training.place}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">
                              {training.employees.length}/{training.maxCountEmployee}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round((training.employees.length / training.maxCountEmployee) * 100)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(training.employees.length / training.maxCountEmployee) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(0, 0, 0, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getProgressColor(training.employees.length, training.maxCountEmployee),
                                transition: 'transform 0.4s ease-in-out'
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right" onClick={e => e.stopPropagation()}>
                        <Tooltip title="Actions">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuOpen(e, training);
                            }}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.08)'
                              }
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Section>

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
          <MenuItem onClick={handleAddParticipants}>
            <ListItemIcon>
              <GroupAddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Add Participants</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleEditTraining}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Training</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleDeleteTraining(selectedTraining)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete Training</ListItemText>
          </MenuItem>
        </Menu>

        <AddParticipantsDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          training={selectedTraining}
          fetchTrainings={fetchTrainings}
        />

        <TrainingParticipantsDialog
          open={participantsDialogOpen}
          onClose={handleCloseParticipantsDialog}
          training={selectedTrainingParticipants}
          fetchTrainings={fetchTrainings}
        />
      </Box>
    </CardContainer>
  );
};

export default PlanningView; 