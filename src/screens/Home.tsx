import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Typography,
    Button,
    IconButton,
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TopicIcon from '@mui/icons-material/Topic';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import Chart from 'chart.js/auto';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';

import { useNavigate } from 'react-router-dom';

interface GeocodedLocation {
    name: string;
    coordinates: [number, number];
    count: number;
    description?: string;
}

const Home: React.FC = () => {
    // const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [visualizationModalOpen, setVisualizationModalOpen] = useState(false);
    const [showEvents, setShowEvents] = useState(true);
    const [showMovements, setShowMovements] = useState(true);
    const emotionsChartRef = useRef<Chart | null>(null);
    const topicsChartRef = useRef<Chart | null>(null);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [geocodedLocations, setGeocodedLocations] = useState<GeocodedLocation[]>([]);
    const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleLogout = () => {
        setLogoutConfirmOpen(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        setLogoutConfirmOpen(false);
        navigate('/login', { replace: true });
    };

    const initializeCharts = () => {
        if (emotionsChartRef.current) emotionsChartRef.current.destroy();
        if (topicsChartRef.current) topicsChartRef.current.destroy();

        const emotionsCtx = document.getElementById('emotionsChart') as HTMLCanvasElement;
        const topicsCtx = document.getElementById('topicsChart') as HTMLCanvasElement;

        if (emotionsCtx && topicsCtx && analysisResult) {
            emotionsChartRef.current = new Chart(emotionsCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(analysisResult.emotions),
                    datasets: [{
                        label: 'Emotion Intensity',
                        data: Object.values(analysisResult.emotions),
                        backgroundColor: ['#93c5fd', '#c084fc', '#fcd34d', '#f87171', '#86efac']
                    }]
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
                    labels: Object.keys(analysisResult.topics),
                    datasets: [{
                        data: Object.values(analysisResult.topics),
                        backgroundColor: ['#93c5fd', '#86efac', '#c084fc', '#fcd34d', '#fca5a5']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } }
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
            if (!validTypes.includes(selectedFile.type)) {
                setUploadError('Invalid file type.');
                setSnackbarOpen(true);
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                setUploadError('File size exceeds 10MB limit.');
                setSnackbarOpen(true);
                return;
            }
            setFile(selectedFile);
            setUploadError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setUploadError('Please select a file to upload.');
            setSnackbarOpen(true);
            return;
        }

        setUploading(true);
        setUploadError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found. Please log in again.');

            // Check if token is expired
            const isTokenExpired = (token: string): boolean => {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    return payload.exp < Date.now() / 1000;
                } catch (error) {
                    return true;
                }
            };

            if (isTokenExpired(token)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login', { replace: true });
                throw new Error('Your session has expired. Please log in again.');
            }

            const formData = new FormData();
            formData.append('files', file);

            const response = await fetch('http://localhost:5000/api/analyze-testimony', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
                credentials: 'include'
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login', { replace: true });
                throw new Error('Your session has expired. Please log in again.');
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to analyze testimony');

            setUploadSuccess(true);
            setSnackbarOpen(true);
            setFile(null);
            setAnalysisResult(data.analysis);

            if (fileInputRef.current) fileInputRef.current.value = '';
            setTimeout(() => setVisualizationModalOpen(true), 1000);
        } catch (error: any) {
            setUploadError(error.message || 'An error occurred during upload');
            setSnackbarOpen(true);
        } finally {
            setUploading(false);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const createNumberedMarker = (number: number, isHighlighted: boolean) => {
        return divIcon({
            className: 'custom-numbered-marker',
            html: `<div class="marker-number ${isHighlighted ? 'highlighted' : ''}">${number}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });
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
        if (analysisResult?.locations) {
            geocodeLocations(analysisResult.locations)
                .then(locations => {
                    setGeocodedLocations(locations);
                });
        }
    }, [analysisResult, geocodeLocations]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        // check if token is expired
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

    useEffect(() => {
        if (visualizationModalOpen) setTimeout(initializeCharts, 100);
        return () => {
            if (!localStorage.getItem('token')) navigate('/login', { replace: true });
            if (emotionsChartRef.current) emotionsChartRef.current.destroy();
            if (topicsChartRef.current) topicsChartRef.current.destroy();
        };
    }, [visualizationModalOpen, analysisResult]);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

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

            <Box className="max-w-7xl mx-auto px-4 py-8">
                {analysisResult && (
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
                )}

                <Box className="text-center py-12">
                    <Typography variant="h6" className="text-white mb-4 font-semibold">
                        Upload testimony for analysis
                    </Typography>
                </Box>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <UploadContainer className="max-w-2xl mx-auto">
                        <Box
                            className="flex flex-col items-center space-y-4"
                            onClick={() => fileInputRef.current?.click()}
                            style={{ cursor: 'pointer' }}>
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
                                {file ? (
                                    <Typography variant="body1" className="text-gray-700 font-medium">
                                        Selected file: {file.name}
                                    </Typography>
                                ) : (
                                    <Typography variant="body1" className="text-gray-700 font-medium">
                                        Drag and drop your war testimony files here
                                    </Typography>
                                )}

                                <Typography variant="body2" className="text-gray-500">
                                    {file ? "Click to change file" : "or click to browse"}
                                </Typography>

                                <Box className="w-full pt-2">
                                    <input
                                        ref={fileInputRef}
                                        id="fileInput"
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt"
                                        className="opacity-0 w-full h-full cursor-pointer"
                                        style={{ top: 0, left: 0 }}
                                        onChange={handleFileChange}
                                    />
                                </Box>

                                <Typography variant="caption" className="text-gray-400 block">
                                    Supported formats: PDF, DOC, DOCX, TXT (up to 10MB)
                                </Typography>

                                {file && (
                                    <Button
                                        variant="contained"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpload();
                                        }}
                                        disabled={uploading}
                                        sx={{
                                            backgroundColor: '#4f46e5',
                                            '&:hover': {
                                                backgroundColor: '#4338ca'
                                            },
                                            textTransform: 'none',
                                            borderRadius: '0.5rem',
                                            padding: '0.5rem 1.5rem',
                                            marginTop: '1rem'
                                        }}
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Testimony'}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </UploadContainer>
                </motion.div>
            </Box>

            {/* Dashboard Modal */}
            <Dialog open={visualizationModalOpen} onClose={() => setVisualizationModalOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle className="flex justify-between items-center bg-gray-50 border-b">
                    <Box>
                        <Typography variant="h6">Analysis Dashboard</Typography>
                        <Typography variant="body2" className="text-gray-500">{analysisResult?.title || 'Personal Account'}</Typography>
                    </Box>
                    <IconButton onClick={() => setVisualizationModalOpen(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent className="!p-6 overflow-y-auto">
                    {analysisResult && (
                        <Box className="space-y-6">
                            {/* Two-column grid for Emotional, Topics, and People */}
                            <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Emotion and topic data Column */}
                                <Box className="space-y-6">
                                    <Paper sx={{ padding: '1rem' }}>
                                        <Box className="flex items-center space-x-2 mb-4">
                                            <PsychologyIcon className="text-blue-500" />
                                            <Typography variant="subtitle1">Emotional Analysis</Typography>
                                        </Box>
                                        <Box className="space-y-4">
                                            <Box className="grid grid-cols-2 gap-4">
                                                {Object.entries(analysisResult.emotions).slice(0, 2).map(([emotion, score], idx) => (
                                                    <Box key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                                                        <Typography variant="body2">{idx === 0 ? 'Primary' : 'Secondary'} Emotion</Typography>
                                                        <Typography variant="h6" className="text-blue-600">{emotion}</Typography>
                                                        <Typography variant="body2">{String(score)}%</Typography>
                                                    </Box>
                                                ))}                                            </Box>
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
                                                {Object.keys(analysisResult.topics).map((topic, idx) => (
                                                    <Typography key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{topic}</Typography>
                                                ))}
                                            </Box>
                                            <Box className="h-[200px]"><canvas id="topicsChart"></canvas></Box>
                                        </Box>
                                    </Paper>
                                </Box>

                                {/* Biological Data */}
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
                                                                <Typography variant="body2">{analysisResult.writer_info[field] || 'Not specified'}</Typography>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" className="font-medium text-gray-600 mb-2">Other People</Typography>
                                                <Box className="space-y-2" sx={{ maxHeight: '455px', overflowY: 'auto' }}>
                                                    {analysisResult.people_mentioned.length > 0 ? analysisResult.people_mentioned.map((person: any, idx: number) => (
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
                    {uploadError || "Testimony uploaded successfully!"}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Home;