import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  CardContainer, 
  Section, 
  SectionHeader, 
  SectionTitle, 
  StyledMuiSelect,
  StyledDatePicker
} from '../../styles/commonStyles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import EventIcon from '@mui/icons-material/Event';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import axiosInstance from '../../axiosInstance';
import { useAppContext } from '../../AppContext';

const PlanningView = () => {
  const { setIsLoading, setErrorOverlay } = useAppContext();
  const [trainings, setTrainings] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchTrainings = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/etc/getAllActivePlaning', {
        params: {
          start: startDate.format('YYYY-MM-DD'),
          end: endDate.format('YYYY-MM-DD')
        }
      });
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
    setSelectedTraining(null);
  };

  const handleAddParticipants = () => {
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleEditTraining = () => {
    // TODO: Implement training editing
    handleMenuClose();
  };

  const handleDeleteTraining = () => {
    // TODO: Implement training deletion
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <CardContainer>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Training Planning
        </Typography>

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
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Training Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Trainer</TableCell>
                  <TableCell>Participants</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trainings.map((training) => (
                  <TableRow
                    key={training.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{training.name}</TableCell>
                    <TableCell>{dayjs(training.date).format('DD.MM.YYYY')}</TableCell>
                    <TableCell>{training.duration} hours</TableCell>
                    <TableCell>{training.trainer}</TableCell>
                    <TableCell>{training.participants?.length || 0}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Actions">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, training)}
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
          <MenuItem onClick={handleDeleteTraining}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete Training</ListItemText>
          </MenuItem>
        </Menu>

        <Dialog
          open={openDialog}
          onClose={handleDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Participants</DialogTitle>
          <DialogContent>
            {/* TODO: Add participant selection form */}
            <Typography>Participant selection form will be implemented here</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleDialogClose} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </CardContainer>
  );
};

export default PlanningView; 