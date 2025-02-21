import { useEffect, useRef, useState } from 'react';
import {
    Typography,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import LogoutIcon from '@mui/icons-material/Logout';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

const Home: React.FC = () => {
    // const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [visualizationModalOpen, setVisualizationModalOpen] = useState(false);
    const [showEvents, setShowEvents] = useState(true);
    const [showMovements, setShowMovements] = useState(true);
    const emotionsChartRef = useRef<Chart | null>(null);
    const topicsChartRef = useRef<Chart | null>(null);

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

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
    };

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

    const UploadButton = styled(Button)(({ theme }) => ({
        backgroundColor: '#4f46e5',
        color: 'white',
        padding: '0.75rem 2rem',
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 600,
        '&:hover': {
            backgroundColor: '#4338ca',
            transform: 'translateY(-2px)',
        },
        transition: 'all 0.2s ease',
    }));

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
                                Welcome, {user.name || 'User'}
                            </Typography>
                            <IconButton onClick={handleLogout} className="text-gray-600 hover:text-indigo-600">
                                <LogoutIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Main Content */}
            {/* <Box className="max-w-7xl mx-auto px-4 py-8"> */}
            {/* <Typography variant="h4" className="font-bold text-gray-800">
              War Testimony Analysis
            </Typography> */}
            {/* <Box className="space-x-4">
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
                Upload War Testimony
              </Button>
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => setVisualizationModalOpen(true)}
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
                View Analysis Dashboard
              </Button>
            </Box> */}

            {/* <Box className="flex justify-end space-x-4 mb-8">
                    <Button
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setVisualizationModalOpen(true)}
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
                        View Analysis Dashboard
                    </Button>
                </Box>

                <Box className="text-center py-12">
                    <Typography variant="h6" className="text-gray-600 mb-4">
                        Contribute to War History Analysis
                    </Typography>
                    <Typography variant="body1" className="text-gray-500">
                        Upload historical war testimonies for analysis and preservation
                    </Typography>
                </Box>

                <Box className="flex justify-center mt-8">

                    <DialogContent className="!p-6">
                        <Box className="space-y-4 mt-4">
                            <Box className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                                <CloudUploadIcon className="text-gray-400 text-4xl mb-2" />
                                <Typography variant="body2" className="text-gray-600">
                                    Upload war testimony file or drag and drop
                                </Typography>
                                <Typography variant="caption" className="text-gray-500">
                                    PDF, DOC, DOCX, TXT up to 10MB
                                </Typography>
                                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" />
                            </Box>
                            <Box className="flex justify-end space-x-2"> */}
            {/* <Button
                  onClick={() => setUploadModalOpen(false)}
                  className="text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button> */}
            {/* <Button
                                    variant="contained"
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Upload
                                </Button>
                            </Box>
                        </Box>
                    </DialogContent>
                </Box>
            </Box> */}

            {/* Upload Modal */}
            {/* <Dialog
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          
        </Dialog> */}
            <Box className="max-w-7xl mx-auto px-4 py-8">
                <Box className="flex justify-end space-x-4 mb-8">
                    <Button
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setVisualizationModalOpen(true)}
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
                        View Analysis Dashboard
                    </Button>
                </Box>

                <Box className="text-center py-12">
                    <Typography variant="h6" className="text-gray-600 mb-4 font-semibold">
                        Contribute to War History Analysis
                    </Typography>
                    <Typography variant="body1" className="text-gray-500 max-w-2xl mx-auto">
                        Upload historical war testimonies for analysis and preservation to help maintain the memory of significant historical events
                    </Typography>
                </Box>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <UploadContainer className="max-w-2xl mx-auto">
                        <Box className="flex flex-col items-center space-y-4">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <CloudUploadIcon className="upload-icon text-gray-400 text-5xl" />
                            </motion.div>

                            <Box className="text-center space-y-2">
                                <Typography
                                    variant="body1"
                                    className="text-gray-700 font-medium"
                                >
                                    Drag and drop your war testimony files here
                                </Typography>
                                <Typography
                                    variant="body2"
                                    className="text-gray-500"
                                >
                                    or click to browse
                                </Typography>
                                <Box className="w-full pt-2">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    className="opacity-0 w-full h-full cursor-pointer"
                                    style={{ top: 0, left: 0 }}
                                />
                                {/* <UploadButton
                                    variant="contained"
                                    startIcon={<CloudUploadIcon />}
                                >
                                    Select File
                                </UploadButton> */}
                            </Box>
                                <Typography
                                    variant="caption"
                                    className="text-gray-400 block"
                                >
                                    Supported formats: PDF, DOC, DOCX, TXT (up to 10MB)
                                </Typography>
                            </Box>
                        </Box>
                    </UploadContainer>
                </motion.div>
            </Box>

            {/* Dashboard Modal - Matching Museum Home */}
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

export default Home;