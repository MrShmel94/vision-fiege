import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Button,
  TextField,
  Paper,
  Chip,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { StyledMuiSelect } from '../../../styles/commonStyles';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import axiosInstance from '../../../axiosInstance';
import { useAppContext } from '../../../AppContext';
import { Client } from "@stomp/stompjs";
import Swal from 'sweetalert2';
import SockJS from "sockjs-client";
import dayjs from 'dayjs';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const AddParticipantsDialog = ({ open, onClose, training, fetchTrainings }) => {
  const { setErrorOverlay } = useAppContext();
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [positionFilter, setPositionFilter] = useState('');
  const [showSavingOverlay, setShowSavingOverlay] = useState(false);
  
  const stompClient = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (open && training) {
      stompClient.current = new Client({
        webSocketFactory: () => new SockJS(`${BASE_URL}/etc`, null, { xhrWithCredentials: true }),
        reconnectDelay: 5000,
        onConnect: () => {
          const topic = `/topic/planing/${training.id}/participants`;
          const currentUserTopic = `/user/topic/planing/${training.id}/current`;

          subscriptionRef.current = stompClient.current.subscribe(topic, (message) => {
            const data = JSON.parse(message.body);

            if (data.type === 'SELECTION_UPDATE') {
              setSelectedEmployees(data.selectedEmployees || []);
              setIsLocked(false);
            }
            if (data.type === 'FINALIZED') {
              setSelectedEmployees(data.selectedEmployees || []);
              setIsLocked(true);
              setShowSavingOverlay(false);
              Swal.fire({
                icon: 'success',
                title: 'Participants saved',
                timer: 2000,
                showConfirmButton: false
              });
              if (onClose) onClose();
              onClose();
              fetchTrainings();
            }

            if (data.type === 'UNLOCKED') {
              setIsLocked(false);
              setShowSavingOverlay(false);
            }

            if (data.type === 'LOCK_INITIATED') {
              setIsLocked(true);
              setShowSavingOverlay(true);
            }
          });

          stompClient.current.publish({
            destination: `/app/planing/${training.id}/get-current`,
            body: "",
          });

          stompClient.current.subscribe(currentUserTopic, (message) => {
            const data = JSON.parse(message.body);
            if (data.type === 'CURRENT') {
              setSelectedEmployees(data.selectedEmployees || []);
            }
          });
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
        },
        onWebSocketClose: () => {
          console.log('WebSocket connection closed');
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
        },
      });

      stompClient.current.activate();

      return () => {
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
        }
        if (stompClient.current) {
          stompClient.current.deactivate();
        }
      };
    }
  }, [open, training]);

  useEffect(() => {
    if (open && training) {
      setSelectedEmployees([]);
      setSearchQuery('');
      setDepartmentFilter('');
      setTeamFilter('');
      setPositionFilter('');
      axiosInstance.get('/etc/availableEmployee', { params: { id: training.id } })
        .then(res => setAvailableEmployees(res.data))
        .catch(() => setErrorOverlay({ open: true, title: 'Error', message: 'Failed to fetch available employees' }));
    }
  }, [open, training, setErrorOverlay]);

  useEffect(() => {
    if (!open) {
      setIsLocked(false);
      setShowSavingOverlay(false);
      setSelectedEmployees([]);
    }
  }, [open]);

  const filteredEmployees = availableEmployees.filter(employee => {
    const matchesSearch =
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.expertis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
    const matchesTeam = !teamFilter || employee.team === teamFilter;
    const matchesPosition = !positionFilter || employee.position === positionFilter;
    return matchesSearch && matchesDepartment && matchesTeam && matchesPosition;
  });

  const departments = [...new Set(availableEmployees.map(emp => emp.department))];
  const teams = [...new Set(availableEmployees.map(emp => emp.team))];
  const positions = [...new Set(availableEmployees.map(emp => emp.position))];

  const handleSaveParticipants = async () => {
    if (!training || selectedEmployees.length === 0) return;

    setIsSubmitting(true);

    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: `/app/planing/${training.id}/participants`,
        body: JSON.stringify({
          type: 'LOCK_INITIATED'
        })
      });
    }

    try {
      await axiosInstance.post('/etc/setPlaningEmployees', {
        planingId: training.id,
        employeeIds: selectedEmployees.map(emp => Number(emp.id)),
        dateTraining: dayjs(training.date).format('YYYY-MM-DD')
      });


      if (stompClient.current?.connected) {
        stompClient.current.publish({
          destination: `/app/planing/${training.id}/participants`,
          body: JSON.stringify({
            type: 'FINALIZED',
            selectedEmployees,
          })
        });
      }
  
      if (fetchTrainings) fetchTrainings();
      if (onClose) onClose();
    } catch {
      setErrorOverlay({ open: true, title: 'Error', message: 'Failed to add participants' });
      setIsSubmitting(false);

      stompClient.current.publish({
        destination: `/app/planing/${training.id}/participants`,
        body: JSON.stringify({
          type: 'UNLOCKED'
        })
      });
    }
  };

  const handleEmployeeSelection = (employee) => {
    const isSelected = selectedEmployees.some(emp => emp.id === employee.id);
    let newSelectedEmployees;
    
    if (isSelected) {
      newSelectedEmployees = selectedEmployees.filter(emp => emp.id !== employee.id);
    } else {
      newSelectedEmployees = [...selectedEmployees, employee];
    }
    
    setSelectedEmployees(newSelectedEmployees);

    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: `/app/planing/${training.id}/participants`,
        body: JSON.stringify({
          trainingId: training.id,
          type: 'SELECTION_UPDATE',
          selectedEmployees: newSelectedEmployees
        })
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ backgroundColor: 'primary.light', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        <GroupAddIcon />
        Add Participants
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
      {showSavingOverlay && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress color="primary" />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Another user is saving...
              </Typography>
            </Box>
          </Box>
        )}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 2, p: 2 }}>
            <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
              <InputLabel>Department</InputLabel>
              <StyledMuiSelect
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                label="Department"
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.filter(Boolean).map(dep => (
                  <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                ))}
              </StyledMuiSelect>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
              <InputLabel>Team</InputLabel>
              <StyledMuiSelect
                value={teamFilter}
                onChange={e => setTeamFilter(e.target.value)}
                label="Team"
              >
                <MenuItem value="">All Teams</MenuItem>
                {teams.filter(Boolean).map(team => (
                  <MenuItem key={team} value={team}>{team}</MenuItem>
                ))}
              </StyledMuiSelect>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
              <InputLabel>Position</InputLabel>
              <StyledMuiSelect
                value={positionFilter}
                onChange={e => setPositionFilter(e.target.value)}
                label="Position"
              >
                <MenuItem value="">All Positions</MenuItem>
                {positions.filter(Boolean).map(pos => (
                  <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                ))}
              </StyledMuiSelect>
            </FormControl>
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search by name or expertise"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              label="Search Employees"
              variant="outlined"
              size="small"
              sx={{ bgcolor: '#FFF', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
            />
          </Box>
          {training && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2">
                  {(training?.employees?.length || 0) + selectedEmployees.length}/{training?.maxCountEmployee || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {training?.maxCountEmployee ? Math.round(((training?.employees?.length || 0) + selectedEmployees.length) / training?.maxCountEmployee * 100) : 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={training?.maxCountEmployee ? (((training?.employees?.length || 0) + selectedEmployees.length) / training?.maxCountEmployee) * 100 : 0}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'rgba(0,0,0,0.08)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor:
                      ((training?.employees?.length || 0) + selectedEmployees.length) >= (training?.maxCountEmployee || 0)
                        ? '#d32f2f'
                        : '#2e7d32',
                    transition: 'transform 0.4s ease-in-out',
                  },
                }}
              />
              {((training?.employees?.length || 0) + selectedEmployees.length) >= (training?.maxCountEmployee || 0) && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                  Maximum number of participants reached!
                </Typography>
              )}
            </Box>
          )}
          <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 3, width: '100%' }}>
            <Box sx={{ flex: 2, minWidth: 0 }}>
              <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto', bgcolor: 'rgba(255,255,255,0.95)' }}>
                <AnimatePresence>
                  {filteredEmployees.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                      No employees found.
                    </Typography>
                  )}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: 3,
                    p: 1
                  }}>
                    {filteredEmployees.map((employee) => {
                      const isSelected = selectedEmployees.some(emp => emp.id === employee.id);
                      const currentCount = (training?.employees?.length || 0) + selectedEmployees.length;
                      const maxCount = training?.maxCountEmployee || 0;
                      const disabled = !isSelected && currentCount >= maxCount;
                      return (
                        <motion.div
                          key={employee.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Paper
                            elevation={isSelected ? 8 : 2}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1.5,
                              p: 2.5,
                              borderRadius: 4,
                              boxShadow: isSelected ? '0 6px 24px rgba(44,183,233,0.18)' : '0 2px 8px rgba(0,0,0,0.04)',
                              background: isSelected ? 'linear-gradient(90deg, #E30613 0%, #FF4D6D 100%)' : '#fff',
                              color: isSelected ? 'white' : 'inherit',
                              opacity: disabled ? 0.5 : 1,
                              cursor: disabled ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: '0 8px 32px rgba(44,183,233,0.22)',
                                background: isSelected ? 'linear-gradient(90deg, #E30613 0%, #FF4D6D 100%)' : 'rgba(44,183,233,0.04)',
                              },
                            }}
                            onClick={() => {
                              if (isLocked || (!isSelected && disabled)) return;
                              handleEmployeeSelection(employee);
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center', color: isSelected ? 'white' : 'primary.main' }}>
                              {employee.firstName} {employee.lastName}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mt: 1 }}>
                              <Chip
                                size="small"
                                label={employee.expertis}
                                sx={{
                                  backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'primary.light',
                                  color: isSelected ? 'white' : 'white',
                                  height: 22,
                                  fontWeight: 500,
                                }}
                              />
                              <Chip
                                size="small"
                                label={employee.position}
                                sx={{
                                  backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'secondary.light',
                                  color: isSelected ? 'white' : 'white',
                                  height: 22,
                                  fontWeight: 500,
                                }}
                              />
                              <Chip
                                size="small"
                                label={employee.department}
                                sx={{
                                  backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'info.light',
                                  color: isSelected ? 'white' : 'white',
                                  height: 22,
                                  fontWeight: 500,
                                }}
                              />
                              <Chip
                                size="small"
                                label={employee.team}
                                sx={{
                                  backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'success.light',
                                  color: isSelected ? 'white' : 'white',
                                  height: 22,
                                  fontWeight: 500,
                                }}
                              />
                            </Box>
                          </Paper>
                        </motion.div>
                      );
                    })}
                  </Box>
                </AnimatePresence>
              </Paper>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, mt: { xs: 3, md: 0 } }}>
              <Paper sx={{ p: 2, minHeight: 120, bgcolor: 'rgba(255,255,255,0.97)' }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>Selected</Typography>
                {selectedEmployees.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>No employees selected</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {selectedEmployees.map((emp) => (
                      <Paper key={emp.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, borderRadius: 2, boxShadow: 0, bgcolor: 'grey.100' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{emp.firstName} {emp.lastName}</Typography>
                        <Button color="error" size="small" onClick={() => setSelectedEmployees(selectedEmployees.filter(e => e.id !== emp.id))}>Remove</Button>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
          <DialogActions sx={{ p: 3, backgroundColor: 'grey.50', justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSaveParticipants}
              disabled={selectedEmployees.length === 0 || isLocked}
              size="medium"
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
              }}
            >
              {isSubmitting ? <CircularProgress size={20} /> : `Add Selected (${selectedEmployees.length})`}
            </Button>
            <Button 
              onClick={onClose}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddParticipantsDialog; 