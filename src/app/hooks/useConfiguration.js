import { useState } from 'react';
import axiosInstance from '../axiosInstance';

const DEFAULT_CONFIG = {
  sex: ['M', 'F'],
  departmentName: [],
  positionName: [],
  shiftName: [],
  countryName: [],
};

export const useConfiguration = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const loadConfig = async () => {
    try {
      const response = await axiosInstance.get('employee/config');
      const data = response.data;
      
      setConfig(prev => ({
        ...prev,
        departmentName: data.departments.map(d => d.name),
        positionName: data.positions.map(p => p.name),
        shiftName: data.shifts.map(s => s.name),
        countryName: data.countries.map(c => c.name),
        agencyName: data.agencies.map(a => a.name),
        siteName: [data.siteName],
        teamName: data.teams.map(t => t.name)
      }));
    } catch (err) {
      console.error('Failed to load configuration:', err);
    } 
  };

  return {
    config,
    loadConfig,
  };
}; 