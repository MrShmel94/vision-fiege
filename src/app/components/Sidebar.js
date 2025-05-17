"use client";

import React, { useState } from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Typography, Divider } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAppContext } from "../AppContext";

export default function Sidebar() {
  const { setCurrentView } = useAppContext();
  const [openEmployees, setOpenEmployees] = useState(false);
  const [openAttendance, setOpenAttendance] = useState(false);
  const [openEtc, setOpenEtc] = useState(false);
  return (
    <Box
      sx={{
        width: 260,
        bgcolor: "#0a0a0a",
        color: "#ffffff",
        borderRadius: 3,
        padding: 2,
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ЛОГОТИП */}
      <Box sx={{ textAlign: "center", mb: 3, py: 1, borderRadius: 2, bgcolor: "rgb(255, 255, 255)" }}>
        {/* <Typography variant="h6" sx={{ fontWeight: "bold", color: "#e5e7eb" }}>FIEGE Vision</Typography> */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                <img src="/logo.png" alt="FIEGE Logo" style={{ height: 35 }} />
              </Typography>
      </Box>

      

      <List>
        <Typography variant="caption" sx={{ color: "#9ca3af", paddingLeft: 2, mb: 1, display: "block" }}>NAVIGATION</Typography>

        <ListItemButton onClick={() => setCurrentView("dashboard")} sx={{ borderRadius: 2, mb: 1 }}>
          <ListItemIcon sx={{ color: "#ffffff" }}><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton onClick={() => setCurrentView("attendanceList")} sx={{ borderRadius: 2, mb: 1 }}>
          <ListItemIcon sx={{ color: "#ffffff" }}><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Attendance" />
        </ListItemButton>

        <ListItemButton onClick={() => setCurrentView("verifySupervisor")} sx={{ borderRadius: 2, mb: 1 }}>
          <ListItemIcon sx={{ color: "#ffffff" }}><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Employee Verif" />
        </ListItemButton>

      </List>

      <Divider sx={{ bgcolor: "#374151", my: 2 }} />

      <List>
        <Typography variant="caption" sx={{ color: "#9ca3af", paddingLeft: 2, mb: 1, display: "block" }}>ETC</Typography>

        <ListItemButton onClick={() => setOpenEtc(!openEtc)} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ color: "#ffffff" }}><PeopleIcon /></ListItemIcon>
          <ListItemText primary="Etc" />
          {openEtc ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>

        <Collapse in={openEtc} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

              <ListItemButton sx={{ pl: 4, borderRadius: 2, mb: 1 }} onClick={() => setCurrentView("addDocument")}>
                <ListItemIcon sx={{ color: "#ffffff" }}><WorkIcon /></ListItemIcon>
                <ListItemText primary="Add Document" />
              </ListItemButton>

            <ListItemButton sx={{ pl: 4, borderRadius: 2, mb: 1 }} onClick={() => setCurrentView("documents")}>
              <ListItemIcon sx={{ color: "#ffffff" }}><WorkIcon /></ListItemIcon>
              <ListItemText primary="Documents" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 4, borderRadius: 2, mb: 1 }} onClick={() => setCurrentView("planning")}>
              <ListItemIcon sx={{ color: "#ffffff" }}><WorkIcon /></ListItemIcon>
              <ListItemText primary="Planning" />
            </ListItemButton>

          </List>
        </Collapse>
      </List>

      <List>
        <Typography variant="caption" sx={{ color: "#9ca3af", paddingLeft: 2, mb: 1, display: "block" }}>Attendance</Typography>

        <ListItemButton onClick={() => setOpenAttendance(!openAttendance)} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ color: "#ffffff" }}><PeopleIcon /></ListItemIcon>
          <ListItemText primary="Attendance" />
          {openAttendance ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>

        <Collapse in={openAttendance} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4, borderRadius: 2, mb: 1 }} onClick={() => setCurrentView("templateAsign")}>
              <ListItemIcon sx={{ color: "#ffffff" }}><WorkIcon /></ListItemIcon>
              <ListItemText primary="Template Assigment" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 4, borderRadius: 2, mb: 1 }} onClick={() => setCurrentView("attendanceList")}>
              <ListItemIcon sx={{ color: "#ffffff" }}><UploadFileIcon /></ListItemIcon>
              <ListItemText primary="Attendance List" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 4, borderRadius: 2, mb: 1 }} onClick={() => setCurrentView("templateCreator")}>
              <ListItemIcon sx={{ color: "#ffffff" }}><UploadFileIcon /></ListItemIcon>
              <ListItemText primary="Creator Template" />
            </ListItemButton>

          </List>
        </Collapse>
      </List>

      <List>
        <Typography variant="caption" sx={{ color: "#9ca3af", paddingLeft: 2, mb: 1, display: "block" }}>EMPLOYEES</Typography>

        <ListItemButton onClick={() => setOpenEmployees(!openEmployees)} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ color: "#ffffff" }}><PeopleIcon /></ListItemIcon>
          <ListItemText primary="Employees" />
          {openEmployees ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>

        <Collapse in={openEmployees} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4, borderRadius: 2, mb: 1 }} onClick={() => setCurrentView("assign")}>
              <ListItemIcon sx={{ color: "#ffffff" }}><WorkIcon /></ListItemIcon>
              <ListItemText primary="Assign Employees" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 4, borderRadius: 2, mb: 1 }} onClick={() => setCurrentView("createEmployee")}>
              <ListItemIcon sx={{ color: "#ffffff" }}><UploadFileIcon /></ListItemIcon>
              <ListItemText primary="Create Employee" />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Box>
  );
}