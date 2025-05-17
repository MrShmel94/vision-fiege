import { styled } from '@mui/material/styles';
import { Box, Typography, TextField, IconButton, Accordion, AccordionSummary, AccordionDetails, Select as MuiSelect, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import Select from 'react-select';

export const PageContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  overflow: 'auto',
  padding: theme.spacing(3),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.3)',
    },
  },
}));

export const StyledAccordion = styled(Accordion)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px !important',
  marginBottom: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  '&:before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    borderRadius: '24px',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.95)',
    },
  },
  '& .MuiAccordionSummary-content': {
    margin: '12px 0',
  },
}));

export const SummaryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  width: '100%',
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
    fontSize: '1.5rem',
  },
}));

export const SummaryInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginLeft: 'auto',
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
}));

export const CardContainer = styled(motion.div)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '24px',
  padding: theme.spacing(3),
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
  overflow: 'hidden',
}));

export const Section = styled(motion.div)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.7)',
  borderRadius: '16px',
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.9)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  },
}));

export const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  gap: theme.spacing(1.5),
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
    fontSize: '1.5rem',
  },
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  flex: 1,
}));

export const FieldGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(2),
}));

export const Field = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

export const FieldLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

export const FieldValue = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: theme.palette.text.primary,
  fontWeight: 400,
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
}));

export const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

export const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#666',
    '&.Mui-focused': {
      color: '#B82136',
    },
  },
  '& .MuiPaper-root': {
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    '& .MuiPickersCalendarHeader-root': {
      backgroundColor: '#B82136',
      color: 'white',
      borderRadius: '12px 12px 0 0',
      '& .MuiPickersArrowSwitcher-root': {
        color: 'white',
      },
    },
    '& .MuiPickersDay-root': {
      '&.Mui-selected': {
        backgroundColor: '#B82136',
        color: 'white',
        '&:hover': {
          backgroundColor: '#8f1a2a',
        },
      },
      '&:hover': {
        backgroundColor: 'rgba(184, 33, 54, 0.1)',
      },
    },
  },
}));

export const StyledTimePicker = styled(TimePicker)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#666',
    '&.Mui-focused': {
      color: '#B82136',
    },
  },
  '& .MuiPaper-root': {
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    '& .MuiClock-root': {
      backgroundColor: '#B82136',
      color: 'white',
      borderRadius: '12px',
    },
    '& .MuiClockNumber-root': {
      color: 'white',
      '&.Mui-selected': {
        backgroundColor: 'white',
        color: '#B82136',
      },
    },
  },
}));

export const reactSelectStyles = {
  control: (base) => ({
    ...base,
    minHeight: 56,
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(0, 0, 0, 0.23)',
    '&:hover': {
      borderColor: 'rgba(0, 0, 0, 0.87)',
    },
    '&.react-select__control--is-focused': {
      borderColor: '#B82136',
      boxShadow: '0 0 0 2px rgba(184, 33, 54, 0.2)',
    },
  }),
  option: (base, state) => ({
    ...base,
    padding: '8px 16px',
    backgroundColor: state.isSelected ? '#B82136' : state.isFocused ? 'rgba(184, 33, 54, 0.1)' : 'white',
    color: state.isSelected ? 'white' : 'inherit',
    '&:active': {
      backgroundColor: '#8f1a2a',
    },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#B82136',
    borderRadius: '12px',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: 'white',
    padding: '2px 8px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'white',
    ':hover': {
      backgroundColor: '#8f1a2a',
      color: 'white',
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  container: (base) => ({
    ...base,
    zIndex: 1,
  }),
};

export const StyledMuiSelect = styled(MuiSelect)(({ theme }) => ({
  '& .react-select__control': {
    minHeight: 56,
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(0, 0, 0, 0.23)',
    '&:hover': {
      borderColor: 'rgba(0, 0, 0, 0.87)',
    },
  },
  '& .react-select__menu': {
    zIndex: 9999,
  },
}));

export const FilterCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.7)',
  borderRadius: '16px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
}));

export const FilterGroup = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.7)',
  borderRadius: '16px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  position: 'relative',
}));

export const FilterGroupTitle = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '-10px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: theme.palette.background.paper,
  padding: '0 8px',
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap', 
}));

export const FilterGroupContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: theme.spacing(2),
  width: '100%',
}));

export const AttendanceRow = ({ 
  style, 
  gridTemplate, 
  employeeData, 
  daysArray, 
  STATUSES,
  onCellClick,
  onEmployeeClick,
  isSelected,
  dayjs 
}) => {
  const { info, attendanceList } = employeeData;
  
  return (
    <div 
      style={{ 
        ...style,
        display: "grid",
        gridTemplateColumns: gridTemplate,
        gap: "1px",
        position: "absolute",
        left: 0,
        right: 0,
        height: "70px",
        margin: 0,
        padding: 0
      }}
    >
      <Box
        onClick={() => onEmployeeClick(info.id)}
        sx={{
          bgcolor: isSelected ? "primary.light" : "#FFF",
          p: 1,
          border: "1px solid #E0E0E0",
          borderRadius: 1,
          boxShadow: isSelected ? 2 : 1,
          alignItems: "center",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 0.3,
          height: "100%",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: isSelected ? "primary.light" : "grey.100",
            transform: "scale(1.02)"
          }
        }}
      >
        <Typography variant="subtitle1" sx={{ color: isSelected ? "primary.contrastText" : "text.primary" }}>
          {info.expertis} - {info.teamName} - {info.shiftName} - {info.positionName}
        </Typography>
        <Typography variant="body2" sx={{ color: isSelected ? "primary.contrastText" : "text.primary" }}>
          {`${info.firstName} ${info.lastName} / ${info.supervisor}`}
        </Typography>
      </Box>
      {daysArray.map((day, colIndex) => {
        const attendanceForDay = attendanceList.find((item) =>
          dayjs(item.attendanceDate).date() === day
        );
        const cellContent = attendanceForDay
          ? attendanceForDay.houseWorked > 0
            ? attendanceForDay.houseWorked
            : attendanceForDay.statusCode
          : "";
        return (
          <Box
            key={colIndex}
            sx={{
              bgcolor:
                attendanceForDay && STATUSES[attendanceForDay.statusCode]
                  ? STATUSES[attendanceForDay.statusCode].color
                  : "#FFF",
              p: 0.5,
              textAlign: "center",
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #E0E0E0",
              cursor: "pointer",
              fontWeight: "bold",
              height: "100%",
              fontSize: "0.8rem",
              color: (theme) => {
                const bgColor =
                  attendanceForDay && STATUSES[attendanceForDay.statusCode]
                    ? STATUSES[attendanceForDay.statusCode].color
                    : "#FFF";
                return getContrastColor(bgColor);
              },
              "&:hover": { bgcolor: "#F0F0F0" },
            }}
            onClick={() => onCellClick(info, colIndex, attendanceForDay)}
          >
            {cellContent === "''" ? "" : cellContent}
          </Box>
        );
      })}
    </div>
  );
};

const getContrastColor = (bgColor) => {
  if (!bgColor) return "#000";

  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? "#000" : "#FFF";
};