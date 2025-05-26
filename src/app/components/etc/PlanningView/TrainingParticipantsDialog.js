import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Paper
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import dayjs from 'dayjs';
import axiosInstance from '../../../axiosInstance';
import { useAppContext } from '../../../AppContext';

const TrainingParticipantsDialog = ({ open, onClose, training, fetchTrainings }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const { setIsLoading, setErrorOverlay } = useAppContext();

  if (!training) return null;

  const handleCardClick = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleRemove = async () => {
    if (!training || selectedIds.length === 0) return;
    setIsLoading(true);
    try {
      await axiosInstance.post('/etc/deletePlaningEmployees', {
        planingId: training.id,
        employeeIds: selectedIds,
        dateTraining: dayjs(training.date).format('YYYY-MM-DD')
      });
      setSelectedIds([]);
      if (fetchTrainings) fetchTrainings();
      if (onClose) onClose();
    } catch (e) {
      setErrorOverlay({
        open: true,
        title: 'Error',
        message: 'Failed to remove employees from training.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPresent = async () => {
    if (!training || selectedIds.length === 0) return;
    setIsLoading(true);
    try {
      await axiosInstance.post('/etc/markPresentEmployees', {
        planingId: training.id,
        employeeIds: selectedIds,
        dateTraining: dayjs(training.date).format('YYYY-MM-DD')
      });
      setSelectedIds([]);
      if (fetchTrainings) fetchTrainings();
      if (onClose) onClose();
    } catch (e) {
      setErrorOverlay({
        open: true,
        title: 'Error',
        message: 'Failed to mark employees as present.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3, px: 4 }}>
        <Paper
          elevation={0}
          sx={{
            bgcolor: 'grey.100',
            p: 3,
            borderRadius: '12px',
            backdropFilter: 'blur(8px)',
            maxWidth: 600,
            mx: 'auto',
            textAlign: 'center',
            boxShadow: 'none',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {training.documentName}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon />
              <Typography variant="body1">
                {dayjs(training.date).format('DD.MM.YYYY')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon />
              <Typography variant="body1">
                {training.timeStart} - {training.timeFinish}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon />
              <Typography variant="body1">
                {training.place}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon />
              <Typography variant="body1">
                {training.employees.length} Participants
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {training.employees.map((employee) => {
            const isSelected = selectedIds.includes(employee.idEmployee);
            return (
              <Grid item xs={12} sm={6} md={4} key={employee.idEmployee}>
                <Card
                  elevation={isSelected ? 8 : 2}
                  sx={{
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    border: isSelected ? '2px solid #E30613' : '2px solid transparent',
                    boxShadow: isSelected ? '0 8px 32px rgba(227,6,19,0.12)' : undefined,
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }
                  }}
                  onClick={() => handleCardClick(employee.idEmployee)}
                >
                  <CardContent>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                          {employee.fullName}
                          {employee.sex === 'F' && <FemaleIcon sx={{ color: '#e91e63', fontSize: 22 }} titleAccess="Female" />}
                          {employee.sex === 'M' && <MaleIcon sx={{ color: '#1976d2', fontSize: 22 }} titleAccess="Male" />}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {employee.expertis}
                        </Typography>
                      </Box>
                      {isSelected && (
                        <CheckCircleIcon color="success" sx={{ fontSize: 28 }} />
                      )}
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {employee.departmentName} • {employee.teamName} • {employee.shiftName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="secondary" />
                        <Typography variant="body2">
                          Supervisor: {employee.fullNameSupervisor}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Registered: {dayjs(employee.date).format('DD.MM.YYYY HH:mm')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        {employee.isPresent ? (
                          <CheckCircleIcon sx={{ color: '#43a047', fontSize: 20 }} titleAccess="Present" />
                        ) : (
                          <HourglassEmptyIcon sx={{ color: '#bdbdbd', fontSize: 20 }} titleAccess="Absent" />
                        )}
                        <Typography variant="body2" sx={{ color: employee.isPresent ? '#43a047' : '#bdbdbd', fontWeight: 500 }}>
                          {employee.isPresent ? 'Present' : 'Absent'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: 'grey.50', justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        {selectedIds.length > 0 && (
          <>
            <Button
              variant="contained"
              color="error"
              startIcon={<RemoveCircleIcon />}
              onClick={handleRemove}
              sx={{ borderRadius: '8px', minWidth: 180 }}
            >
              Remove ({selectedIds.length})
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleMarkPresent}
              sx={{ borderRadius: '8px', minWidth: 180 }}
            >
              Mark as Present
            </Button>
          </>
        )}
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: '8px', minWidth: 120 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrainingParticipantsDialog; 