"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon, Upload as UploadIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosInstance from '../../axiosInstance';
import { useSnackbar } from 'notistack';
import { useAppContext } from '../../AppContext';

const UploadPerformanceModal = ({ open, onClose }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { setIsLoading, setErrorOverlay } = useAppContext();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFiles();
    }
  }, [open]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('download/getNameFiles');
      setFiles(response.data);
    } catch (error) {
      setErrorOverlay({
        open: true,
        message: 'Failed to fetch files'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await axiosInstance.post('download/uploadPerformanceGD', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      enqueueSnackbar('File uploaded successfully', { variant: 'success' });
      fetchFiles();
    } catch (error) {
      setErrorOverlay({
        open: true,
        message: error.response?.data?.message || 'Failed to upload file'
      });
    } finally {
      setUploading(false);
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
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        pb: 2,
        fontWeight: 600,
        color: theme.palette.primary.main
      }}>
        Upload Performance File
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="file-upload"
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button
              component="span"
              variant="contained"
              startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
              disabled={uploading}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {uploading ? 'Uploading...' : 'Upload New File'}
            </Button>
          </label>
        </Box>

        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
          Uploaded Files
        </Typography>

        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            background: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File Name</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>{file.fileName}</TableCell>
                  <TableCell>{file.fullName}</TableCell>
                  <TableCell>{new Date(file.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: '12px',
                        backgroundColor: file.status === 'COMPLETED' ? 'success.light' : 'warning.light',
                        color: file.status === 'COMPLETED' ? 'success.dark' : 'warning.dark',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      {file.status}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {files.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No files uploaded yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            px: 3,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadPerformanceModal; 