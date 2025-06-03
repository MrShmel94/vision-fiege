"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from '../../axiosInstance';
import { useAppContext } from '../../AppContext';
import { 
  PageContainer, 
  PageHeader, 
  PageHeaderTitle, 
  PageHeaderSubtitle,
  StyledDatePicker,
  FilterCard,
  FilterGroup,
  FilterGroupTitle,
  FilterGroupContent,
} from '../../styles/commonStyles';
import Swal from 'sweetalert2';

const PerformanceView = () => {
  const { setIsLoading, setErrorOverlay } = useAppContext();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [expertisInput, setExpertisInput] = useState('');

  const handleLoadData = () => {
    if (!startDate || !endDate || !expertisInput) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        icon: 'warning',
        confirmButtonColor: '#B82136',
        confirmButtonText: 'OK'
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to load performance data
      const response = axiosInstance.post('performance/load', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        expertis: expertisInput.split(',').map(e => e.trim())
      });
      
      // TODO: Handle response data
      console.log(response.data);
      
    } catch (error) {
      setErrorOverlay({
        open: true,
        message: error.response?.data?.message || 'Failed to load performance data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <PageContainer>
        <PageHeader>
          <PageHeaderTitle>Employee Performance</PageHeaderTitle>
          <PageHeaderSubtitle>
            View and analyze employee performance metrics for selected period
          </PageHeaderSubtitle>
        </PageHeader>

        <FilterCard>
          <FilterGroup>
            <FilterGroupTitle>Date Range</FilterGroupTitle>
            <FilterGroupContent>
              <StyledDatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined"
                  }
                }}
              />
              <StyledDatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined"
                  }
                }}
              />
            </FilterGroupContent>
          </FilterGroup>

          <FilterGroup>
            <FilterGroupTitle>Employee Selection</FilterGroupTitle>
            <FilterGroupContent>
              <TextField
                fullWidth
                label="Employee Expertis"
                variant="outlined"
                value={expertisInput}
                onChange={(e) => setExpertisInput(e.target.value)}
                placeholder="Enter expertis numbers separated by commas"
                helperText="Example: 12345, 67890, 11111"
              />
            </FilterGroupContent>
          </FilterGroup>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLoadData}
              sx={{
                borderRadius: '20px',
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Load Performance Data
            </Button>
          </Box>
        </FilterCard>

        {/* TODO: Add performance data table here */}
      </PageContainer>
    </LocalizationProvider>
  );
};

export default PerformanceView; 