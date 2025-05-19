"use client";

import React, { useState } from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import { useAppContext } from "../AppContext";
import { gradientKeyframes } from "../theme";
import {
  DashboardCustomizeRounded,
  GroupRounded,
  AssignmentRounded,
  DescriptionRounded,
  EventNoteRounded,
  VerifiedUserRounded,
  PersonAddRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  SettingsRounded,
  AnalyticsRounded,
  WorkHistoryRounded,
  CalendarMonthRounded,
  BadgeRounded,
  SecurityRounded
} from "@mui/icons-material";

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 280,
  background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)",
  color: "#ffffff",
  height: "100%",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  position: "sticky",
  top: 0,
  overflow: "hidden",
  borderRadius: "24px",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 50% 0%, rgba(184, 33, 54, 0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
}));

const LogoSection = styled(Box)(({ theme }) => ({
  height: "80px",
  position: "relative",
  overflow: "hidden",
  background: "rgba(255, 255, 255, 0.03)",
  backdropFilter: "blur(10px)",
  borderBottom: "1px solid rgba(184, 33, 54, 0.2)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(45deg, rgba(184, 33, 54, 0.1) 0%, rgba(0, 142, 147, 0.1) 100%)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 50% 50%, rgba(184, 33, 54, 0.1) 0%, transparent 70%)",
  },
}));

const LogoWrapper = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& img": {
    height: "50px",
    filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))",
  },
}));

const MenuSection = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  background: "linear-gradient(180deg, rgba(184, 33, 54, 0.03) 0%, transparent 100%)",
  overflow: "auto",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(184, 33, 54, 0.3)",
    borderRadius: "3px",
    "&:hover": {
      background: "rgba(184, 33, 54, 0.4)",
    },
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  borderRadius: 16,
  marginBottom: 4,
  transition: "all 0.3s ease",
  background: selected ? "rgba(184, 33, 54, 0.15)" : "transparent",
  border: "1px solid",
  borderColor: selected ? "rgba(184, 33, 54, 0.3)" : "rgba(255, 255, 255, 0.05)",
  "&:hover": {
    background: "rgba(184, 33, 54, 0.1)",
    transform: "translateX(5px)",
    borderColor: "rgba(184, 33, 54, 0.2)",
    "& .MuiListItemIcon-root": {
      color: "#B82136",
      transform: "scale(1.1)",
    },
  },
  "&.Mui-selected": {
    background: "rgba(184, 33, 54, 0.15)",
    borderColor: "rgba(184, 33, 54, 0.3)",
    "&:hover": {
      background: "rgba(184, 33, 54, 0.2)",
    },
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 40,
  transition: "all 0.3s ease",
  color: "rgba(255, 255, 255, 0.7)",
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  "& .MuiTypography-root": {
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.9)",
  },
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "1px",
  padding: "16px 16px 8px",
  marginTop: 8,
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: "50%",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    background: "#B82136",
    transform: "translateY(-50%)",
  },
}));

const menuItems = {
  main: [
    { title: "Dashboard", icon: <DashboardCustomizeRounded />, view: "dashboard" },
    // { title: "Analytics", icon: <AnalyticsRounded />, view: "analytics" },
    { title: "Manage Roles", icon: <SecurityRounded />, view: "manageRoles" },
    { title: "Employee Verification", icon: <VerifiedUserRounded />, view: "verifySupervisor" },
  ],
  employees: [
    { title: "Assign Employees", icon: <PersonAddRounded />, view: "assign" },
    { title: "Create Employee", icon: <GroupRounded />, view: "createEmployee" },
  ],
  attendance: [
    { title: "Template Assignment", icon: <AssignmentRounded />, view: "templateAsign" },
    { title: "Attendance List", icon: <WorkHistoryRounded />, view: "attendanceList" },
    { title: "Template Creator", icon: <CalendarMonthRounded />, view: "templateCreator" },
  ],
  documents: [
    { title: "Add Document", icon: <DescriptionRounded />, view: "addDocument" },
    { title: "Documents", icon: <BadgeRounded />, view: "documents" },
    { title: "Planning", icon: <EventNoteRounded />, view: "planning" },
  ],
};

export default function Sidebar() {
  const { setCurrentView, currentView } = useAppContext();
  const [openSections, setOpenSections] = useState({
    employees: false,
    attendance: false,
    documents: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => {
      const newState = {
        employees: false,
        attendance: false,
        documents: false,
      };
      newState[section] = !prev[section];
      return newState;
    });
  };

  return (
    <>
      <style>{gradientKeyframes}</style>
      <SidebarContainer>
        <LogoSection>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <LogoWrapper>
              <img src="/logo.png" alt="FIEGE Logo" />
            </LogoWrapper>
          </motion.div>
        </LogoSection>

        <MenuSection>
          <CategoryTitle>MAIN MENU</CategoryTitle>
          {menuItems.main.map((item) => (
            <StyledListItemButton 
              key={item.title} 
              onClick={() => setCurrentView(item.view)}
              selected={currentView === item.view}
            >
              <StyledListItemIcon>{item.icon}</StyledListItemIcon>
              <StyledListItemText primary={item.title} />
            </StyledListItemButton>
          ))}

          <CategoryTitle>EMPLOYEES</CategoryTitle>
          <StyledListItemButton 
            onClick={() => toggleSection("employees")}
            selected={openSections.employees}
          >
            <StyledListItemIcon>
              <GroupRounded />
            </StyledListItemIcon>
            <StyledListItemText primary="Employees" />
            {openSections.employees ? <ExpandLessRounded /> : <ExpandMoreRounded />}
          </StyledListItemButton>
          <Collapse in={openSections.employees} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {menuItems.employees.map((item) => (
                <StyledListItemButton
                  key={item.title}
                  sx={{ pl: 4 }}
                  onClick={() => setCurrentView(item.view)}
                  selected={currentView === item.view}
                >
                  <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                  <StyledListItemText primary={item.title} />
                </StyledListItemButton>
              ))}
            </List>
          </Collapse>

          <CategoryTitle>ATTENDANCE</CategoryTitle>
          <StyledListItemButton 
            onClick={() => toggleSection("attendance")}
            selected={openSections.attendance}
          >
            <StyledListItemIcon>
              <CalendarMonthRounded />
            </StyledListItemIcon>
            <StyledListItemText primary="Attendance" />
            {openSections.attendance ? <ExpandLessRounded /> : <ExpandMoreRounded />}
          </StyledListItemButton>
          <Collapse in={openSections.attendance} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {menuItems.attendance.map((item) => (
                <StyledListItemButton
                  key={item.title}
                  sx={{ pl: 4 }}
                  onClick={() => setCurrentView(item.view)}
                  selected={currentView === item.view}
                >
                  <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                  <StyledListItemText primary={item.title} />
                </StyledListItemButton>
              ))}
            </List>
          </Collapse>

          <CategoryTitle>DOCUMENTS</CategoryTitle>
          <StyledListItemButton 
            onClick={() => toggleSection("documents")}
            selected={openSections.documents}
          >
            <StyledListItemIcon>
              <DescriptionRounded />
            </StyledListItemIcon>
            <StyledListItemText primary="Documents" />
            {openSections.documents ? <ExpandLessRounded /> : <ExpandMoreRounded />}
          </StyledListItemButton>
          <Collapse in={openSections.documents} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {menuItems.documents.map((item) => (
                <StyledListItemButton
                  key={item.title}
                  sx={{ pl: 4 }}
                  onClick={() => setCurrentView(item.view)}
                  selected={currentView === item.view}
                >
                  <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                  <StyledListItemText primary={item.title} />
                </StyledListItemButton>
              ))}
            </List>
          </Collapse>
        </MenuSection>

        <Box sx={{ 
          p: 2, 
          borderTop: "1px solid rgba(184, 33, 54, 0.1)",
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(10px)"
        }}>
          <StyledListItemButton>
            <StyledListItemIcon>
              <SettingsRounded />
            </StyledListItemIcon>
            <StyledListItemText primary="Settings" />
          </StyledListItemButton>
        </Box>
      </SidebarContainer>
    </>
  );
}