import React, { useState, useEffect } from 'react';
import {
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Security as SecurityIcon,
  Event as EventIcon,
  Notes as NotesIcon,
  DateRange as DateRangeIcon,
  Assessment as AssessmentIcon,
  Stars as StarsIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import axiosInstance from '../../axiosInstance';
import { useAppContext } from '../../AppContext';
import {
  PageContainer,
  StyledAccordion,
  SummaryContent,
  SummaryInfo,
} from '../../styles/commonStyles';
import EmployeeSection from './EmployeeSection';

const SECTION_CONFIG = {
  personal: {
    icon: PersonIcon,
    title: 'Personal Information',
    fields: [
      { label: 'First Name', field: 'firstName' },
      { label: 'Last Name', field: 'lastName' },
      { label: 'Sex', field: 'sex' },
      { label: 'BR Code', field: 'brCode' },
      { label: 'Expertise', field: 'expertis' },
    ],
  },
  work: {
    icon: BusinessIcon,
    title: 'Work Information',
    fields: [
      { label: 'Department', field: 'departmentName' },
      { label: 'Position', field: 'positionName' },
      { label: 'Team', field: 'teamName' },
      { label: 'Site', field: 'siteName' },
      { label: 'Shift', field: 'shiftName' },
      { label: 'Agency', field: 'agencyName' },
      { label: 'Country', field: 'countryName' },
    ],
  },
  contract: {
    icon: WorkIcon,
    title: 'Contract Information',
    fields: [
      { label: 'Start Date', field: 'dateStartContract' },
      { label: 'End Date', field: 'dateFinishContract' },
      { label: 'FTE', field: 'fte' },
    ],
  },
  access: {
    icon: SecurityIcon,
    title: 'Access & Certifications',
    fields: [
      { label: 'Is Supervisor', field: 'isSupervisor' },
      { label: 'Can Have Account', field: 'isCanHasAccount' },
      { label: 'Account Valid From', field: 'validFromAccount' },
      { label: 'Account Valid To', field: 'validToAccount' },
    ],
  },
  safety: {
    icon: EventIcon,
    title: 'Safety Certifications',
    fields: [
      { label: 'BHP Current', field: 'dateBhpNow' },
      { label: 'BHP Future', field: 'dateBhpFuture' },
      { label: 'ADR Current', field: 'dateAdrNow' },
      { label: 'ADR Future', field: 'dateAdrFuture' },
    ],
  },
  notes: {
    icon: NotesIcon,
    title: 'Additional Notes',
    fields: [{ label: 'Notes', field: 'note' }],
  },
};

const EmployeeCard = ({ expertis, initialData }) => {
  const [employee, setEmployee] = useState(initialData || null);
  const [expanded, setExpanded] = useState('profile');
  const { setErrorOverlay } = useAppContext();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axiosInstance.get(`employee/getEmployeeInformation/${expertis}`);
        setEmployee(response.data);
      } catch (error) {
        setErrorOverlay({
          open: true,
          message: 'Failed to load employee data. Please try again.',
        });
      }
    };

    if (expertis && !initialData) {
      fetchEmployeeData();
    }
  }, [expertis, initialData, setErrorOverlay]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleSectionUpdate = (sectionKey, updatedData) => {
    setEmployee(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  if (!employee) return null;

  const renderProfileSummary = () => (
    <SummaryInfo>
      <Typography>{employee.expertis}</Typography>
      <Typography>•</Typography>
      <Typography>{`${employee.firstName} ${employee.lastName}`}</Typography>
      <Typography>•</Typography>
      <Typography>{employee.departmentName}</Typography>
    </SummaryInfo>
  );

  return (
    <PageContainer>
      <StyledAccordion
        expanded={expanded === 'profile'}
        onChange={handleAccordionChange('profile')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SummaryContent>
            <PersonIcon />
            <Typography variant="h6" fontWeight="600">Employee Profile</Typography>
            {expanded !== 'profile' && renderProfileSummary()}
          </SummaryContent>
        </AccordionSummary>
        <AccordionDetails>
          <Box position="relative">
            {Object.entries(SECTION_CONFIG).map(([key, { icon, title, fields }]) => (
              <EmployeeSection
                key={key}
                icon={icon}
                title={title}
                fields={fields}
                employee={employee}
                sectionKey={key}
                onUpdate={(updatedData) => handleSectionUpdate(key, updatedData)}
              />
            ))}
          </Box>
        </AccordionDetails>
      </StyledAccordion>

      <StyledAccordion
        expanded={expanded === 'attendance'}
        onChange={handleAccordionChange('attendance')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SummaryContent>
            <DateRangeIcon />
            <Typography variant="h6" fontWeight="600">Attendance List</Typography>
            {expanded !== 'attendance' && (
              <SummaryInfo>
                <Typography>Last Month: 22/22 days</Typography>
                <Typography>•</Typography>
                <Typography>Current Month: 15/15 days</Typography>
              </SummaryInfo>
            )}
          </SummaryContent>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Attendance details will be implemented here</Typography>
        </AccordionDetails>
      </StyledAccordion>

      <StyledAccordion
        expanded={expanded === 'performance'}
        onChange={handleAccordionChange('performance')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SummaryContent>
            <AssessmentIcon />
            <Typography variant="h6" fontWeight="600">Performance</Typography>
            {expanded !== 'performance' && (
              <SummaryInfo>
                <Typography>Current Rating: 4.8/5.0</Typography>
                <Typography>•</Typography>
                <Typography>Tasks: 45/50 completed</Typography>
              </SummaryInfo>
            )}
          </SummaryContent>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Performance metrics will be implemented here</Typography>
        </AccordionDetails>
      </StyledAccordion>

      <StyledAccordion
        expanded={expanded === 'evaluate'}
        onChange={handleAccordionChange('evaluate')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SummaryContent>
            <StarsIcon />
            <Typography variant="h6" fontWeight="600">Evaluate</Typography>
            {expanded !== 'evaluate' && (
              <SummaryInfo>
                <Typography>Last Evaluation: 92/100</Typography>
                <Typography>•</Typography>
                <Typography>Next Review: 2 months</Typography>
              </SummaryInfo>
            )}
          </SummaryContent>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Evaluation details will be implemented here</Typography>
        </AccordionDetails>
      </StyledAccordion>
    </PageContainer>
  );
};

export default EmployeeCard; 