import { useState, useEffect, useRef, useCallback } from 'react';
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
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useNavigate } from 'react-router-dom';

interface Testimony {
  filename: string;
  title: string;
  description: string;
  writer_info: any;
  people_mentioned: any[];
  emotions: { [key: string]: number };
  locations: { [key: string]: { count: number; description: string } };
  topics: { [key: string]: number };
  upload_date: string;
  file_type: string;
}

interface GeocodedLocation {
  name: string;
  coordinates: [number, number];
  count: number;
  description?: string;
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
  const [geocodedLocations, setGeocodedLocations] = useState<GeocodedLocation[]>([]);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const navigate = useNavigate();

  const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;

    try {
      // Get payload from JWT token
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check if token is expired
      return payload.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Check if token is expired on component mount
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
      return;
    }
    // Set up periodic token expiration check
    const checkTokenInterval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken || isTokenExpired(currentToken)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        clearInterval(checkTokenInterval);
      }
    }, 30000); // Check every 30 seconds
    // Clean up on component unmount
    return () => {
      clearInterval(checkTokenInterval);
    };
  }, [navigate]);

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
      const token = localStorage.getItem('token');
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        return;
      }

      const response = await fetch('http://localhost:5000/api/museum-testimonies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Handle 401 Unauthorized response
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
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
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const invalidFiles = newFiles.filter(file => !validTypes.includes(file.type));
      if (invalidFiles.length > 0) {
        setUploadError('Invalid file type.');
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
      if (!token) throw new Error('Authentication token not found.');

      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        throw new Error('Your session has expired. Please log in again.');
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
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      // Handle 401 Unauthorized response
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        throw new Error('Your session has expired. Please log in again.');
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to analyze testimonies');

      setUploadSuccess(true);
      setSnackbarOpen(true);
      setFiles([]);
      setUploadModalOpen(false);
      fetchTestimonies();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      setUploadError(error.message || 'An error occurred during upload');
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
    }
  };

  const geocodeLocations = useCallback(async (locations: { [key: string]: any }) => {
    const geocodedLocations: GeocodedLocation[] = [];

    for (const [name, data] of Object.entries(locations)) {
      try {
        // Use OpenStreetMap's Nominatim API for geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}`
        );
        const results = await response.json();

        if (results && results.length > 0) {
          geocodedLocations.push({
            name,
            coordinates: [parseFloat(results[0].lat), parseFloat(results[0].lon)],
            count: typeof data === 'object' ? data.count || 0 : data,
            description: typeof data === 'object' ? data.description || 'Mentioned in testimony' : `Mentioned ${data} times`
          });
        } else {
          console.warn(`Could not geocode location: ${name}`);
        }
      } catch (error) {
        console.error(`Error geocoding ${name}:`, error);
      }
    }

    return geocodedLocations;
  }, []);

  useEffect(() => {
    if (selectedTestimony?.locations) {
      geocodeLocations(selectedTestimony.locations)
        .then(locations => {
          setGeocodedLocations(locations);
        });
    }
  }, [selectedTestimony, geocodeLocations]);

  const createNumberedMarker = (number: number, isHighlighted: boolean) => {
    return divIcon({
      className: 'custom-numbered-marker',
      html: `<div class="marker-number ${isHighlighted ? 'highlighted' : ''}">${number}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });
  };

  const viewTestimony = async (filename: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        return;
      }

      const response = await fetch(`http://localhost:5000/api/museum-testimony/${filename}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Handle 401 Unauthorized response
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      setSelectedTestimony(data.testimony);
      setVisualizationModalOpen(true);
    } catch (error) {
      console.error('Error fetching testimony:', error);
    }
  };

  const initializeCharts = () => {
    if (emotionsChartRef.current) emotionsChartRef.current.destroy();
    if (topicsChartRef.current) topicsChartRef.current.destroy();

    const emotionsCtx = document.getElementById('emotionsChart') as HTMLCanvasElement;
    const topicsCtx = document.getElementById('topicsChart') as HTMLCanvasElement;

    if (emotionsCtx && topicsCtx && selectedTestimony) {
      emotionsChartRef.current = new Chart(emotionsCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(selectedTestimony.emotions),
          datasets: [{ label: 'Emotion Intensity', data: Object.values(selectedTestimony.emotions), backgroundColor: ['#93c5fd', '#c084fc', '#fcd34d', '#f87171', '#86efac'] }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, title: { display: true, text: 'Emotional Distribution' } },
          scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: 'Intensity (%)' } } }
        }
      });

      topicsChartRef.current = new Chart(topicsCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(selectedTestimony.topics),
          datasets: [{ data: Object.values(selectedTestimony.topics), backgroundColor: ['#93c5fd', '#86efac', '#c084fc', '#fcd34d', '#fca5a5'] }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } }
        }
      });
    }
  };

  useEffect(() => {
    fetchTestimonies();
    if (visualizationModalOpen) setTimeout(initializeCharts, 100);
    return () => {
      if (!localStorage.getItem('token')) navigate('/login', { replace: true });
      if (emotionsChartRef.current) emotionsChartRef.current.destroy();
      if (topicsChartRef.current) topicsChartRef.current.destroy();
    };
  }, [visualizationModalOpen, selectedTestimony]);

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

      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        throw new Error('Your session has expired. Please log in again.');
      }

      const response = await fetch(`http://localhost:5000/api/museum-testimony/${testimonyToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Handle 401 Unauthorized response
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        throw new Error('Your session has expired. Please log in again.');
      }

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
                Welcome, {user.name || 'User'} {/* Display user's name */}
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
                  <TableCell>{testimony.title ? testimony.title.replace(/\.[^/.]+$/, "").replace(/_/g, ' '): ""}</TableCell>
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
              Maximum analyze 5 files
            </Typography>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <UploadContainer>
                <Box className="flex flex-col items-center space-y-4" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                  {uploading ? <CircularProgress size={40} /> : <CloudUploadIcon className="upload-icon text-gray-400 text-5xl" />}
                  <Box className="text-center space-y-2">
                    {files.length > 0 ? <Typography>Selected files: {files.map(f => f.name).join(', ')}</Typography> : <Typography>Drag and drop your war testimony files here</Typography>}
                    <Typography variant="body2">{files.length > 0 ? "Click to change files" : "or click to browse"}</Typography>
                    <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileChange} />
                    <Typography variant="caption">Supported formats: PDF, DOC, DOCX, TXT (up to 10MB)</Typography>
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
      <Dialog open={visualizationModalOpen} onClose={() => setVisualizationModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle className="flex justify-between items-center bg-gray-50 border-b">
          <Box>
            <Typography variant="h6">{selectedTestimony?.title ? selectedTestimony.title.replace(/\.[^/.]+$/, "").replace(/_/g, ' '): ""}</Typography>
            <Typography variant="body2">{selectedTestimony?.description || 'Testimony Analysis'}</Typography>
          </Box>
          <IconButton onClick={() => setVisualizationModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent className="!p-6 overflow-y-auto">
          {selectedTestimony && (
            <Box className="space-y-6">
              {/* Two-column grid for Emotional, Topics, and People */}
              <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Box className="space-y-6">
                  <Paper sx={{ padding: '1rem' }}>
                    <Box className="flex items-center space-x-2 mb-4">
                      <PsychologyIcon className="text-blue-500" />
                      <Typography variant="subtitle1">Emotional Analysis</Typography>
                    </Box>
                    <Box className="space-y-4">
                      <Box className="grid grid-cols-2 gap-4">
                        {Object.entries(selectedTestimony.emotions).slice(0, 2).map(([emotion, score], idx) => (
                          <Box key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                            <Typography variant="body2">{idx === 0 ? 'Primary' : 'Secondary'} Emotion</Typography>
                            <Typography variant="h6">{emotion}</Typography>
                            <Typography variant="body2">{score}%</Typography>
                          </Box>
                        ))}
                      </Box>
                      <Box className="h-[200px]"><canvas id="emotionsChart"></canvas></Box>
                    </Box>
                  </Paper>

                  <Paper sx={{ padding: '1rem' }}>
                    <Box className="flex items-center space-x-2 mb-4">
                      <TopicIcon className="text-green-500" />
                      <Typography variant="h6">Key Topics</Typography>
                    </Box>
                    <Box className="space-y-4">
                      <Box className="flex flex-wrap gap-2">
                        {Object.keys(selectedTestimony.topics).map((topic, idx) => (
                          <Typography key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{topic}</Typography>
                        ))}
                      </Box>
                      <Box className="h-[200px]"><canvas id="topicsChart"></canvas></Box>
                    </Box>
                  </Paper>
                </Box>

                <Box className="space-y-6">
                  <Paper sx={{ padding: '1rem' }}>
                    <Box className="flex items-center space-x-2 mb-4">
                      <PersonIcon className="text-indigo-500" />
                      <Typography variant="h6">People Mentioned</Typography>
                    </Box>
                    <Box className="space-y-4">
                      <Box className="border-b pb-4">
                        <Typography variant="body2" className="font-medium text-gray-600 mb-2">Writer</Typography>
                        <Box className="bg-gray-50 p-3 rounded-lg">
                          <Box className="grid grid-cols-2 gap-2">
                            {['Name', 'Country', 'Role', 'Age at time', 'Birth year', 'Death year'].map(field => (
                              <Box key={field}>
                                <Typography variant="caption">{field}</Typography>
                                <Typography variant="body2">{selectedTestimony.writer_info[field] || 'Not specified'}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" className="font-medium text-gray-600 mb-2">Other People</Typography>
                        <Box className="space-y-2" sx={{ maxHeight: '455px', overflowY: 'auto' }}>
                          {selectedTestimony.people_mentioned.length > 0 ? selectedTestimony.people_mentioned.map((person: any, idx: number) => (
                            <Box key={idx} className="bg-gray-50 p-3 rounded-lg">
                              <Box className="flex justify-between items-start">
                                <Box>
                                  <Typography variant="body2">{person.name !== "Unspecified" ? person.name : "Unknown Person"}</Typography>
                                  <Typography variant="caption">{person.role}</Typography>
                                </Box>
                                <Typography variant="caption">{person.region}</Typography>
                              </Box>
                            </Box>
                          )) : <Typography variant="body2" className="text-gray-500 italic">No other people mentioned.</Typography>}
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              </Box>

              {/* Geographical Data */}
              <Paper sx={{ padding: '1rem' }}>
                <Box className="flex items-center justify-between mb-4">
                  <Box className="flex items-center space-x-2">
                    <PublicIcon className="text-red-500" />
                    <Typography variant="h6">Geographical Data</Typography>
                  </Box>
                  <Box className="flex space-x-2">
                    <Button variant="contained" size="small" onClick={() => setShowEvents(!showEvents)} className={showEvents ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}>Events</Button>
                    <Button variant="contained" size="small" onClick={() => setShowMovements(!showMovements)} className={showMovements ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>Movements</Button>
                  </Box>
                </Box>
                <Box className="h-[400px] rounded-lg">
                  <style>{`
                    .custom-numbered-marker {
                      background: none;
                      border: none;
                    }
                    .marker-number {
                      width: 24px;
                      height: 24px;
                      background-color: #4f46e5;
                      color: white;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-weight: bold;
                      font-size: 12px;
                      border: 2px solid white;
                      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    }
                    .marker-number.highlighted {
                      background-color: #ef4444;
                      transform: scale(1.2);
                      transition: all 0.2s ease;
                    }
                  `}</style>
                  <MapContainer
                    center={geocodedLocations.length > 0
                      ? geocodedLocations[0].coordinates
                      : [51.5074, -0.1278]}
                    zoom={geocodedLocations.length > 0 ? 4 : 5}
                    className="h-full w-full"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='© OpenStreetMap contributors'
                    />

                    {showEvents && geocodedLocations.map((location, idx) => (
                      <Marker
                        key={idx}
                        position={location.coordinates}
                        icon={createNumberedMarker(idx + 1, hoveredLocation === location.name)}
                        eventHandlers={{
                          mouseover: () => setHoveredLocation(location.name),
                          mouseout: () => setHoveredLocation(null)
                        }}
                      >
                        <Tooltip permanent={hoveredLocation === location.name}>
                          <Typography variant="subtitle2">
                            {location.name} - {location.count} mention{location.count !== 1 ? 's' : ''}
                          </Typography>
                        </Tooltip>
                        <Popup>
                          <Typography variant="subtitle2">{location.name}</Typography>
                          <Typography variant="body2">{location.description}</Typography>
                          <Typography variant="caption">{location.count} mention{location.count !== 1 ? 's' : ''}</Typography>
                        </Popup>
                      </Marker>
                    ))}

                    {showMovements && geocodedLocations.length > 1 && (
                      <Polyline
                        positions={geocodedLocations.map(loc => loc.coordinates)}
                        color="#10b981"
                        weight={3}
                        opacity={0.8}
                      />
                    )}
                  </MapContainer>
                </Box>
              </Paper>
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