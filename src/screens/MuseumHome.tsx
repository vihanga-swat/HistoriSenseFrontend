import { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  TextareaAutosize,
  Box,
  Paper,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TopicIcon from '@mui/icons-material/Topic';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import Chart from 'chart.js/auto';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useNavigate } from 'react-router-dom';

// Define types for testimony data
interface WriterInfo {
  Name: string;
  Country?: string;
  Role: string;
  "Age at time"?: string;
  "Birth year"?: string;
  "Death year"?: string;
}

interface PersonMentioned {
  name: string;
  role: string;
  region?: string;
}

interface Event {
  coordinates?: [number, number];
  title?: string;
  description?: string;
  date?: string;
}

interface Testimony {
  filename: string;
  title: string;
  description: string;
  writer_info: WriterInfo;
  people_mentioned: PersonMentioned[];
  upload_date: string;
  file_type: string;
  events?: Event[];
}

const MHome: React.FC = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [visualizationModalOpen, setVisualizationModalOpen] = useState(false);
  const [showEvents, setShowEvents] = useState(true);
  const [showMovements, setShowMovements] = useState(true);
  const emotionsChartRef = useRef<Chart | null>(null);
  const topicsChartRef = useRef<Chart | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [selectedTestimony, setSelectedTestimony] = useState<Testimony | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [testimonyToDelete, setTestimonyToDelete] = useState<string | null>(null);

  const navigate = useNavigate();

  const userRole = localStorage.getItem('role') || 'museum';

  const styles = {
    modalContent: {
      '& .MuiDialogTitle-root': {
        padding: '16px 24px',
        borderBottom: '1px solid rgba(0,0,0,0.12)'
      },
      '& .MuiDialogContent-root': {
        padding: '24px'
      }
    },
    popupContent: {
      margin: '8px 12px',
      '& h3': {
        marginBottom: '4px',
        color: '#1f2937'
      },
      '& p': {
        margin: '2px 0'
      }
    }
  };

  // const testimonies = [
  //   {
  //     title: 'World War II Memoir',
  //     uploadDate: 'Feb 10, 2024',
  //     fileType: '.pdf'
  //   },
  //   {
  //     title: 'Family Migration Story',
  //     uploadDate: 'Feb 8, 2024',
  //     fileType: '.docx'
  //   }
  // ];

  // const events = [
  //   {
  //     coordinates: [51.5074, -0.1278],
  //     title: 'London',
  //     description: 'Starting point - Military preparation',
  //     date: 'June 1, 1944'
  //   },
  //   {
  //     coordinates: [50.8198, -1.0879],
  //     title: 'Portsmouth',
  //     description: 'Embarkation point for D-Day',
  //     date: 'June 5, 1944'
  //   },
  //   {
  //     coordinates: [49.3433, -0.5255],
  //     title: 'Normandy',
  //     description: 'D-Day landing location',
  //     date: 'June 6, 1944'
  //   }
  // ];

  const UploadContainer = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)',
    border: '2px dashed #9ca3af',
    borderRadius: '12px',
    padding: '2rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#4f46e5',
      background: 'linear-gradient(135deg, #eef2ff 0%, #dbeafe 100%)',
      '& .upload-icon': {
        color: '#4f46e5',
        transform: 'scale(1.1)',
      },
    },
  }));

  const fetchTestimonies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/museum-testimonies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data: { testimonies: Testimony[] } = await response.json();
      setTestimonies(data.testimonies || []);
    } catch (error) {
      console.error('Error fetching testimonies:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      if (files.length + newFiles.length > 5) {
        setUploadError('Maximum 5 files allowed');
        setSnackbarOpen(true);
        return;
      }

      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];
      const invalidFiles = newFiles.filter(file => !validTypes.includes(file.type));
      if (invalidFiles.length > 0) {
        setUploadError('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.');
        setSnackbarOpen(true);
        return;
      }

      const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setUploadError('File size exceeds 10MB limit.');
        setSnackbarOpen(true);
        return;
      }

      setFiles([...files, ...newFiles]);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadError('Please select at least one file to upload.');
      setSnackbarOpen(true);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('files', file);
        const titleInput = document.getElementById(`title_${index}`) as HTMLInputElement;
        const descriptionInput = document.getElementById(`description_${index}`) as HTMLTextAreaElement;
        formData.append(`title_${file.name}`, titleInput?.value || file.name);
        formData.append(`description_${file.name}`, descriptionInput?.value || '');
      });

      const response = await fetch('http://localhost:5000/api/analyze-testimony', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data: { message: string } = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze testimonies');
      }

      setUploadSuccess(true);
      setSnackbarOpen(true);
      setFiles([]);
      setUploadModalOpen(false);
      fetchTestimonies();

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setUploadError(error.message || 'An error occurred during upload');
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
    }
  };

  const viewTestimony = async (filename: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/museum-testimony/${filename}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data: { testimony: Testimony } = await response.json();
      setSelectedTestimony(data.testimony);
      setVisualizationModalOpen(true);
    } catch (error) {
      console.error('Error fetching testimony:', error);
    }
  };

  const initializeCharts = () => {
    if (emotionsChartRef.current) {
      emotionsChartRef.current.destroy();
    }
    if (topicsChartRef.current) {
      topicsChartRef.current.destroy();
    }

    const emotionsCtx = document.getElementById('emotionsChart') as HTMLCanvasElement;
    const topicsCtx = document.getElementById('topicsChart') as HTMLCanvasElement;

    if (emotionsCtx && topicsCtx) {
      emotionsChartRef.current = new Chart(emotionsCtx, {
        type: 'bar',
        data: {
          labels: ['Hope', 'Anxiety', 'Pride', 'Fear', 'Relief'],
          datasets: [{
            label: 'Emotion Intensity',
            data: [45, 28, 15, 8, 4],
            backgroundColor: ['#93c5fd', '#c084fc', '#fcd34d', '#f87171', '#86efac'],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Emotional Distribution' },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: { display: true, text: 'Intensity (%)' },
            },
          },
        },
      });

      topicsChartRef.current = new Chart(topicsCtx, {
        type: 'doughnut',
        data: {
          labels: ['Military Operations', 'Civilian Interactions', 'War Impact', 'Daily Life', 'Combat Experience'],
          datasets: [{
            data: [30, 25, 20, 15, 10],
            backgroundColor: ['#93c5fd', '#86efac', '#c084fc', '#fcd34d', '#fca5a5'],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { boxWidth: 12 },
            },
          },
        },
      });
    }
  };

  useEffect(() => {
    fetchTestimonies();
    if (visualizationModalOpen) {
      setTimeout(initializeCharts, 100);
    }
    return () => {
      if (!localStorage.getItem('token')) {
        navigate('/login', { replace: true });
      }
      if (emotionsChartRef.current) {
        emotionsChartRef.current.destroy();
      }
      if (topicsChartRef.current) {
        topicsChartRef.current.destroy();
      }
    };
  }, [visualizationModalOpen, navigate]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    setLogoutConfirmOpen(false);
    navigate('/login', { replace: true });
  };

  const handleDeleteTestimony = async (filename: string) => {
    setTestimonyToDelete(filename);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteTestimony = async () => {
    if (!testimonyToDelete) return;
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
  
      const response = await fetch(`http://localhost:5000/api/museum-testimony/${testimonyToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data: { message: string } = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete testimony');
      }
  
      setTestimonies(testimonies.filter(t => t.filename !== testimonyToDelete));
      setUploadSuccess(true);
      setUploadError(null);
      setSnackbarOpen(true);
    } catch (error: any) {
      setUploadError(error.message || 'An error occurred while deleting the testimony');
      setSnackbarOpen(true);
    } finally {
      setDeleteConfirmOpen(false);
      setTestimonyToDelete(null);
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}') as { name?: string };

  return (
    <div className="gradient-bg min-h-screen">
      <Dialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ffffff',
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', padding: '0 24px 24px' }}>
          {/* <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            color: '#333333',
                            marginBottom: '16px',
                        }}
                    >
                        Logout Confirmation
                    </Typography> */}
          <MeetingRoomIcon className="text-indigo-600 text-3xl" fontSize='large' />
          <Typography
            variant="body1"
            sx={{
              color: '#666666',
              marginBottom: '24px',
            }}
          >
            Are you sure you want to logout?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Button
              variant="outlined"
              onClick={() => setLogoutConfirmOpen(false)}
              sx={{
                textTransform: 'none',
                borderRadius: '4px',
                borderColor: '#483fdd',
                color: '#483fdd',
                padding: '8px 16px',
                '&:hover': {
                  borderColor: '#0056b3',
                  backgroundColor: 'rgba(0, 123, 255, 0.04)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={confirmLogout}
              sx={{
                textTransform: 'none',
                borderRadius: '4px',
                backgroundColor: '#483fdd',
                padding: '8px 16px',
                '&:hover': {
                  backgroundColor: '#0056b3',
                },
              }}
            >
              Confirm
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ffffff',
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', padding: '0 24px 24px' }}>
          <DeleteIcon className="text-red-600 text-3xl" fontSize='large' />
          <Typography variant="body1" sx={{ color: '#666666', marginBottom: '24px' }}>
            Are you sure you want to delete this testimony?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Button
              variant="outlined"
              onClick={() => setDeleteConfirmOpen(false)}
              sx={{
                textTransform: 'none',
                borderRadius: '4px',
                borderColor: '#ef4444',
                color: '#ef4444',
                padding: '8px 16px',
                '&:hover': {
                  borderColor: '#dc2626',
                  backgroundColor: 'rgba(239, 68, 68, 0.04)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={confirmDeleteTestimony}
              sx={{
                textTransform: 'none',
                borderRadius: '4px',
                backgroundColor: '#ef4444',
                padding: '8px 16px',
                '&:hover': {
                  backgroundColor: '#dc2626',
                },
              }}
            >
              Delete
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Navigation */}
      <Box component="nav" className="bg-white shadow-lg">
        <Box className="max-w-7xl mx-auto px-4">
          <Box className="flex justify-between items-center h-16">
            <Box className="flex items-center">
              <HistoryEduIcon className="text-indigo-600 text-3xl" />
              <span className="ml-2 text-xl font-bold text-gray-800">HistoriSense</span>
            </Box>
            <Box className="flex items-center space-x-4">
              <Typography className="text-gray-700">
                Welcome, {user.name || 'User'} {/* Assuming the user's name is stored under 'name' */}
              </Typography>
              <IconButton
                onClick={handleLogout}
                className="text-gray-600 hover:text-indigo-600"
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className="max-w-7xl mx-auto px-4 py-8">
        <Box className="flex justify-end space-x-4 mb-8">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setUploadModalOpen(true)}
            sx={{
              backgroundColor: '#4f46e5',
              '&:hover': {
                backgroundColor: '#4338ca'
              },
              textTransform: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem'
            }}
          >
            Upload Testimony
          </Button>
        </Box>

        <Paper className="p-6 rounded-lg shadow-md">
          <span className="ml-2 text-xl font-bold text-gray-800">Your Testimonies</span>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell>Title</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell>File Type</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {testimonies.map((testimony, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell>{testimony.title}</TableCell>
                  <TableCell>{new Date(testimony.upload_date).toLocaleDateString()}</TableCell>
                  <TableCell>{testimony.file_type}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => viewTestimony(testimony.filename)}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteTestimony(testimony.filename)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle className="flex justify-between items-center bg-gray-50 border-b">
          <Typography variant="h6">Upload Testimony</Typography>
          <IconButton onClick={() => setUploadModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="!p-6">
          <Box className="space-y-4 mt-4">
            <Typography variant="body2" className="text-gray-600">
              Upload up to 5 files
            </Typography>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <UploadContainer
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFiles = Array.from(e.dataTransfer.files);
                  handleFileChange({ target: { files: droppedFiles } } as React.ChangeEvent<HTMLInputElement>);
                }}
              >
                <Box
                  className="flex flex-col items-center space-y-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {uploading ? (
                      <CircularProgress size={40} className="text-indigo-600" />
                    ) : (
                      <CloudUploadIcon className="upload-icon text-gray-400 text-5xl" />
                    )}
                  </motion.div>
                  <Box className="text-center space-y-2">
                    {files.length > 0 ? (
                      <Typography variant="body1" className="text-gray-700 font-medium">
                        Selected files: {files.map(f => f.name).join(', ')}
                      </Typography>
                    ) : (
                      <Typography variant="body1" className="text-gray-700 font-medium">
                        Drag and drop your war testimony files here
                      </Typography>
                    )}
                    <Typography variant="body2" className="text-gray-500">
                      {files.length > 0 ? "Click to change files" : "or click to browse"}
                    </Typography>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={handleFileChange}
                      onClick={(e) => {
                        e.stopPropagation();
                        (e.currentTarget as HTMLInputElement).value = '';
                      }}
                    />
                    <Typography variant="caption" className="text-gray-400 block">
                      Supported formats: PDF, DOC, DOCX, TXT (up to 10MB)
                    </Typography>
                  </Box>
                </Box>
              </UploadContainer>
            </motion.div>
            {files.length > 0 && (
              <Box className="space-y-4">
                {files.map((file, index) => (
                  <Box key={index} className="space-y-2 border p-4 rounded-md relative">
                    <Box className="flex justify-between items-center">
                      <Typography variant="body1" className="text-gray-700 font-medium">
                        {file.name}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          const newFiles = files.filter((_, i) => i !== index);
                          setFiles(newFiles);
                        }}
                        size="small"
                        sx={{ color: '#ef4444' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <TextField
                      fullWidth
                      label={`Title for ${file.name}`}
                      variant="outlined"
                      id={`title_${index}`}
                      defaultValue={file.name}
                    />
                    <TextareaAutosize
                      className="w-full p-3 border rounded-md min-h-[100px]"
                      placeholder={`Description for ${file.name}`}
                      id={`description_${index}`}
                    />
                  </Box>
                ))}
              </Box>
            )}
            {files.length > 0 && (
              <Box className="flex justify-end space-x-2">
                <Button onClick={() => setUploadModalOpen(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={uploading}
                  sx={{
                    backgroundColor: '#4f46e5',
                    '&:hover': { backgroundColor: '#4338ca' },
                    textTransform: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1.5rem',
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload Testimonies'}
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Visualization Modal */}
      <Dialog
        open={visualizationModalOpen}
        onClose={() => setVisualizationModalOpen(false)}
        maxWidth="lg"
        fullWidth
        sx={styles.modalContent}
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            margin: '32px'
          }
        }}
      >
        <DialogTitle className="flex justify-between items-center bg-gray-50 border-b sticky top-0 z-10">
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937' }}>
              {selectedTestimony?.title || 'Analysis Dashboard'}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              {selectedTestimony?.description || 'Testimony Analysis'}
            </Typography>
          </Box>
          <IconButton onClick={() => setVisualizationModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="!p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {selectedTestimony && (
            <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Box className="space-y-6">
                <Paper sx={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.12)', backgroundColor: '#ffffff' }}>
                  <Box className="flex items-center space-x-2 mb-4">
                    <PsychologyIcon className="text-blue-500" />
                    <Typography variant="subtitle1" sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>
                      Emotional Analysis
                    </Typography>
                  </Box>
                  <Box className="space-y-4">
                    <Box className="grid grid-cols-2 gap-4">
                      <Box className="text-center p-3 bg-gray-50 rounded-lg">
                        <Typography variant="body2" className="font-medium text-gray-800">Primary Emotion</Typography>
                        <Typography variant="h6" className="text-blue-600">Hope</Typography>
                        <Typography variant="body2" className="text-gray-500">45%</Typography>
                      </Box>
                      <Box className="text-center p-3 bg-gray-50 rounded-lg">
                        <Typography variant="body2" className="font-medium text-gray-800">Secondary Emotion</Typography>
                        <Typography variant="h6" className="text-purple-600">Anxiety</Typography>
                        <Typography variant="body2" className="text-gray-500">28%</Typography>
                      </Box>
                    </Box>
                    <Box className="h-[200px]">
                      <canvas id="emotionsChart"></canvas>
                    </Box>
                  </Box>
                </Paper>

                {/* Key Topics */}
                <Paper
                  sx={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(0,0,0,0.12)',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <Box className="flex items-center space-x-2 mb-4">
                    <TopicIcon className="text-green-500" />
                    <Typography variant="h6" className="font-semibold text-gray-800">
                      Key Topics
                    </Typography>
                  </Box>
                  <Box className="space-y-4">
                    <Box className="flex flex-wrap gap-2">
                      <Typography className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        Military Operations
                      </Typography>
                      <Typography className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Civilian Interactions
                      </Typography>
                      <Typography className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        War Impact
                      </Typography>
                      <Typography className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        Daily Life
                      </Typography>
                      <Typography className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        Combat Experience
                      </Typography>
                    </Box>
                    <Box className="h-[200px]">
                      <canvas id="topicsChart"></canvas>
                    </Box>
                  </Box>
                </Paper>
              </Box>

              {/* Right Column */}
              <Box className="space-y-6">
                {/* Biographical Data */}
                <Paper sx={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.12)', backgroundColor: '#ffffff' }}>
                  <Box className="flex items-center space-x-2 mb-4">
                    <PersonIcon className="text-indigo-500" />
                    <Typography variant="h6" className="font-semibold text-gray-800">People Mentioned</Typography>
                  </Box>
                  <Box className="space-y-4">
                    <Box className="border-b pb-4">
                      <Typography variant="body2" className="font-medium text-gray-600 mb-2">Writer</Typography>
                      <Box className="bg-gray-50 p-3 rounded-lg">
                        <Box className="grid grid-cols-2 gap-2">
                          <Box>
                            <Typography variant="caption" className="text-gray-500">Name</Typography>
                            <Typography variant="body2" className="font-medium">
                              {selectedTestimony.writer_info.Name || "Not specified"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" className="text-gray-500">Country</Typography>
                            <Typography variant="body2" className="font-medium">
                              {selectedTestimony.writer_info.Country || "Not specified"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" className="text-gray-500">Role</Typography>
                            <Typography variant="body2" className="font-medium">
                              {selectedTestimony.writer_info.Role || "Not specified"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" className="text-gray-500">Age at Time</Typography>
                            <Typography variant="body2" className="font-medium">
                              {selectedTestimony.writer_info["Age at time"] || "Not specified"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" className="text-gray-500">Birth Year</Typography>
                            <Typography variant="body2" className="font-medium">
                              {selectedTestimony.writer_info["Birth year"] || "Not specified"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" className="text-gray-500">Death Year</Typography>
                            <Typography variant="body2" className="font-medium">
                              {selectedTestimony.writer_info["Death year"] || "Not specified"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" className="font-medium text-gray-600 mb-2">Other People</Typography>
                      <Box
                        className="space-y-2"
                        sx={{
                          maxHeight: selectedTestimony.people_mentioned.length > 5 ? '455px' : 'auto',
                          overflowY: selectedTestimony.people_mentioned.length > 5 ? 'auto' : 'visible',
                          paddingRight: selectedTestimony.people_mentioned.length > 5 ? '8px' : '0',
                        }}
                      >
                        {selectedTestimony.people_mentioned && selectedTestimony.people_mentioned.length > 0 ? (
                          selectedTestimony.people_mentioned.map((person, index) => (
                            <Box key={index} className="bg-gray-50 p-3 rounded-lg">
                              <Box className="flex justify-between items-start">
                                <Box>
                                  <Typography variant="body2" className="font-medium">
                                    {person.name !== "Unspecified" ? person.name : "Unknown Person"}
                                  </Typography>
                                  <Typography variant="caption" className="text-gray-500">
                                    {person.role !== "Unspecified" ? person.role : "Unknown role"}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" className="text-gray-500">
                                  {person.region !== "Unspecified" ? person.region : "Unknown location"}
                                </Typography>
                              </Box>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" className="text-gray-500 italic">
                            No other people specifically mentioned in the testimony.
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Box>

              <Box className="mt-4">
                {/* Geographical Data */}
                <Paper sx={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.12)', backgroundColor: '#ffffff' }}>
                  <Box className="flex items-center justify-between mb-4">
                    <Box className="flex items-center space-x-2">
                      <PublicIcon className="text-red-500" />
                      <Typography variant="h6" className="font-semibold text-gray-800">Geographical Data</Typography>
                    </Box>
                    <Box className="flex space-x-2">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setShowEvents(!showEvents)}
                        className={`${showEvents ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'} hover:bg-blue-200`}
                      >
                        Events
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setShowMovements(!showMovements)}
                        className={`${showMovements ? 'bg-green-100 text-green-800' : 'bg-gray-100'} hover:bg-green-200`}
                      >
                        Movements
                      </Button>
                    </Box>
                  </Box>
                  <Box className="h-[300px] rounded-lg">
                    <MapContainer center={[51.5074, -0.1278]} zoom={5} className="h-full w-full">
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© OpenStreetMap contributors'
                      />
                      {showEvents && selectedTestimony.events?.map((event, index) => (
                        <CircleMarker
                          key={index}
                          center={event.coordinates || [51.5074, -0.1278]}
                          radius={8}
                          fillColor="#4f46e5"
                          color="#fff"
                          weight={2}
                          opacity={1}
                          fillOpacity={0.8}
                        >
                          <Popup>
                            <Typography variant="subtitle2" className="font-semibold">{event.title || 'Unknown Location'}</Typography>
                            <Typography variant="body2" className="text-gray-600">{event.description || 'No description'}</Typography>
                            <Typography variant="caption" className="text-gray-500">{event.date || 'Unknown date'}</Typography>
                          </Popup>
                        </CircleMarker>
                      ))}
                      {showMovements && selectedTestimony.events?.length > 1 && (
                        <Polyline
                          positions={selectedTestimony.events.map(event => event.coordinates || [51.5074, -0.1278])}
                          color="#10b981"
                          weight={2}
                          dashArray="5, 5"
                          opacity={0.8}
                        />
                      )}
                    </MapContainer>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={uploadError ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {uploadError || "Testimonies uploaded successfully!"}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MHome;