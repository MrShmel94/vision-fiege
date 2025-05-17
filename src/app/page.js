"use client";

import React from "react";
import Dashboard from "./components/Dashboard";
import AssignEmployeesView from "./components/Employee/AssignEmployeesView";
import CreateEmployeesView from "./components/Employee/CreateEmployeesView";
import AttendanceListView from "./components/Attendance/AttendanceListView";
import TemplateAsigment from "./components/Attendance/TemplateAsigment";
import TemplateCreator from "./components/Attendance/TemplateCreatorView";
import VerifySupervisorsView from "./components/Employee/VerifySupervisorView";
import EmployeeCard from "./components/Employee/EmployeeCard";
import { Box, Typography } from "@mui/material";
import { useAppContext } from "./AppContext";
import AddDocumentView from "./components/etc/AddDocumentView";
import DocumentsView from "./components/etc/DocumentsView";
import PlanningView from "./components/etc/PlanningView";

const HomePage = () => {
  const { currentView, selectedExpertis, initialData } = useAppContext();

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "assign":
        return <AssignEmployeesView />;
      case "createEmployee":
        return <CreateEmployeesView />;
      case "attendanceList":
        return <AttendanceListView />;  
      case "templateAsign":
        return <TemplateAsigment />;
      case "templateCreator":
        return <TemplateCreator />;
      case "verifySupervisor":
        return <VerifySupervisorsView />;
      case "employeeCard":
        return <EmployeeCard expertis={selectedExpertis} initialData={initialData} />;
      case "addDocument":
        return <AddDocumentView />;
      case "documents":
        return <DocumentsView />;
      case "planning":
        return <PlanningView />;
      default:
        return (
          <Box
            sx={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography variant="h3" color="primary" gutterBottom>
              Welcome to Vision Fiege
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Discover the future of logistics powered by AI and technology.
            </Typography>
          </Box>
        );
    }
  };

  return <Box>{renderContent()}</Box>;
};

export default HomePage;