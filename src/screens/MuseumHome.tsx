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
  Paper
} from '@mui/material';
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
import Chart from 'chart.js/auto';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useNavigate } from 'react-router-dom';

const MHome: React.FC = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [visualizationModalOpen, setVisualizationModalOpen] = useState(false);
  const [showEvents, setShowEvents] = useState(true);
  const [showMovements, setShowMovements] = useState(true);
  const emotionsChartRef = useRef<Chart | null>(null);
  const topicsChartRef = useRef<Chart | null>(null);

  const navigate = useNavigate();

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

  const testimonies = [
    {
      title: 'World War II Memoir',
      uploadDate: 'Feb 10, 2024',
      fileType: '.pdf'
    },
    {
      title: 'Family Migration Story',
      uploadDate: 'Feb 8, 2024',
      fileType: '.docx'
    }
  ];

  const events = [
    {
      coordinates: [51.5074, -0.1278],
      title: 'London',
      description: 'Starting point - Military preparation',
      date: 'June 1, 1944'
    },
    {
      coordinates: [50.8198, -1.0879],
      title: 'Portsmouth',
      description: 'Embarkation point for D-Day',
      date: 'June 5, 1944'
    },
    {
      coordinates: [49.3433, -0.5255],
      title: 'Normandy',
      description: 'D-Day landing location',
      date: 'June 6, 1944'
    }
  ];

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
            backgroundColor: [
              '#93c5fd',
              '#c084fc',
              '#fcd34d',
              '#f87171',
              '#86efac'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Emotional Distribution'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Intensity (%)'
              }
            }
          }
        }
      });

      topicsChartRef.current = new Chart(topicsCtx, {
        type: 'doughnut',
        data: {
          labels: ['Military Operations', 'Civilian Interactions', 'War Impact', 'Daily Life', 'Combat Experience'],
          datasets: [{
            data: [30, 25, 20, 15, 10],
            backgroundColor: [
              '#93c5fd',
              '#86efac',
              '#c084fc',
              '#fcd34d',
              '#fca5a5'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12
              }
            }
          }
        }
      });
    }
  };

  useEffect(() => {
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
  }, [visualizationModalOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove JWT token from localStorage
    navigate('/login', { replace: true }); // Redirect to login page
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="gradient-bg min-h-screen">
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
              <IconButton onClick={handleLogout} className="text-gray-600 hover:text-indigo-600">
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
          <span className="ml-2 text-xl font-bold text-gray-800">
            Your Testimonies
          </span>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="text-xs font-medium text-gray-500 uppercase">Title</TableCell>
                <TableCell className="text-xs font-medium text-gray-500 uppercase">Upload Date</TableCell>
                <TableCell className="text-xs font-medium text-gray-500 uppercase">File Type</TableCell>
                <TableCell className="text-xs font-medium text-gray-500 uppercase">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {testimonies.map((testimony, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell>{testimony.title}</TableCell>
                  <TableCell>{testimony.uploadDate}</TableCell>
                  <TableCell>{testimony.fileType}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => setVisualizationModalOpen(true)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton className="text-red-600 hover:text-red-900">
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
      <Dialog
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center bg-gray-50 border-b">
          <Typography variant="h6" className="font-bold text-gray-800">Upload Testimony</Typography>
          <IconButton onClick={() => setUploadModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="!p-6">
          <Box className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Title"
              variant="outlined"
              className="bg-white"
            />
            <TextareaAutosize
              className="w-full p-3 border rounded-md min-h-[100px] bg-white"
              placeholder="Description"
            />
            <Box className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <CloudUploadIcon className="text-gray-400 text-4xl mb-2" />
              <Typography variant="body2" className="text-gray-600">
                Upload a file or drag and drop
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                PDF, DOC, DOCX, TXT up to 10MB
              </Typography>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" />
            </Box>
            <Box className="flex justify-end space-x-2">
              <Button
                onClick={() => setUploadModalOpen(false)}
                className="text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Upload
              </Button>
            </Box>
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
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#1f2937'
              }}
            >
              Analysis Dashboard
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              World War II Memories - Personal Account
            </Typography>
          </Box>
          <IconButton onClick={() => setVisualizationModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="!p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <Box className="space-y-6">
              {/* Emotional Analysis */}
              <Paper
                sx={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(0,0,0,0.12)',
                  backgroundColor: '#ffffff'
                }}
              >
                <Box className="flex items-center space-x-2 mb-4">
                  <PsychologyIcon className="text-blue-500" />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#1f2937'
                    }}
                  >
                    Emotional Analysis
                  </Typography>
                </Box>
                <Box className="space-y-4">
                  <Box className="grid grid-cols-2 gap-4">
                    <Box className="text-center p-3 bg-gray-50 rounded-lg">
                      <Typography variant="body2" className="font-medium text-gray-800">
                        Primary Emotion
                      </Typography>
                      <Typography variant="h6" className="text-blue-600">
                        Hope
                      </Typography>
                      <Typography variant="body2" className="text-gray-500">
                        45%
                      </Typography>
                    </Box>
                    <Box className="text-center p-3 bg-gray-50 rounded-lg">
                      <Typography variant="body2" className="font-medium text-gray-800">
                        Secondary Emotion
                      </Typography>
                      <Typography variant="h6" className="text-purple-600">
                        Anxiety
                      </Typography>
                      <Typography variant="body2" className="text-gray-500">
                        28%
                      </Typography>
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
              <Paper
                sx={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(0,0,0,0.12)',
                  backgroundColor: '#ffffff'
                }}
              >
                <Box className="flex items-center space-x-2 mb-4">
                  <PersonIcon className="text-indigo-500" />
                  <Typography variant="h6" className="font-semibold text-gray-800">
                    People Mentioned
                  </Typography>
                </Box>
                <Box className="space-y-4">
                  {/* Writer Info */}
                  <Box className="border-b pb-4">
                    <Typography variant="body2" className="font-medium text-gray-600 mb-2">
                      Writer
                    </Typography>
                    <Box className="bg-gray-50 p-3 rounded-lg">
                      <Box className="grid grid-cols-2 gap-2">
                        <Box>
                          <Typography variant="caption" className="text-gray-500">
                            Name
                          </Typography>
                          <Typography variant="body2" className="font-medium">
                            Poll Smith Vander
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-gray-500">
                            Role
                          </Typography>
                          <Typography variant="body2" className="font-medium">
                            Soldier
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-gray-500">
                            Age at Time
                          </Typography>
                          <Typography variant="body2" className="font-medium">
                            24 years
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-gray-500">
                            Unit
                          </Typography>
                          <Typography variant="body2" className="font-medium">
                            4th Infantry
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Other People */}
                  <Box>
                    <Typography variant="body2" className="font-medium text-gray-600 mb-2">
                      Other People
                    </Typography>
                    <Box className="space-y-2">
                      <Box className="bg-gray-50 p-3 rounded-lg">
                        <Box className="flex justify-between items-start">
                          <Box>
                            <Typography variant="body2" className="font-medium">
                              Commanding Officer
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                              Military Personnel
                            </Typography>
                          </Box>
                          <Typography variant="caption" className="text-gray-500">
                            2 mentions
                          </Typography>
                        </Box>
                      </Box>
                      <Box className="bg-gray-50 p-3 rounded-lg">
                        <Box className="flex justify-between items-start">
                          <Box>
                            <Typography variant="body2" className="font-medium">
                              French Residents
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                              Civilians
                            </Typography>
                          </Box>
                          <Typography variant="caption" className="text-gray-500">
                            3 mentions
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Geographical Data */}
              <Paper
                sx={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(0,0,0,0.12)',
                  backgroundColor: '#ffffff'
                }}
              >
                <Box className="flex items-center justify-between mb-4">
                  <Box className="flex items-center space-x-2">
                    <PublicIcon className="text-red-500" />
                    <Typography variant="h6" className="font-semibold text-gray-800">
                      Geographical Data
                    </Typography>
                  </Box>
                  <Box className="flex space-x-2">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setShowEvents(!showEvents)}
                      className={`${showEvents ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                        } hover:bg-blue-200`}
                    >
                      Events
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setShowMovements(!showMovements)}
                      className={`${showMovements ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                        } hover:bg-green-200`}
                    >
                      Movements
                    </Button>
                  </Box>
                </Box>
                <Box className="h-[300px] rounded-lg">
                  <MapContainer
                    center={[51.5074, -0.1278]}
                    zoom={5}
                    className="h-full w-full"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='© OpenStreetMap contributors'
                    />
                    {showEvents && events.map((event, index) => (
                      <CircleMarker
                        key={index}
                        center={event.coordinates}
                        radius={8}
                        fillColor="#4f46e5"
                        color="#fff"
                        weight={2}
                        opacity={1}
                        fillOpacity={0.8}
                      >
                        <Popup>
                          <Typography variant="subtitle2" className="font-semibold">
                            {event.title}
                          </Typography>
                          <Typography variant="body2" className="text-gray-600">
                            {event.description}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500">
                            {event.date}
                          </Typography>
                        </Popup>
                      </CircleMarker>
                    ))}
                    {showMovements && (
                      <Polyline
                        positions={events.map(event => event.coordinates)}
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MHome;