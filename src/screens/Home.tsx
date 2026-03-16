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
    Alert,
    useTheme as useMuiTheme,
    Tooltip as MuiTooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TopicIcon from '@mui/icons-material/Topic';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Chart from 'chart.js/auto';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTheme } from '../components/ThemeProvider';

interface GeocodedLocation {
    name: string;
    coordinates: [number, number];
    count: number;
    description?: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', damping: 20, stiffness: 100 }
    }
};

const Home: React.FC = () => {
    const [visualizationModalOpen, setVisualizationModalOpen] = useState(false);
    const [showEvents, setShowEvents] = useState(true);
    const [showMovements, setShowMovements] = useState(true);
    const emotionsChartRef = useRef<Chart | null>(null);
    const topicsChartRef = useRef<Chart | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [geocodedLocations, setGeocodedLocations] = useState<GeocodedLocation[]>([]);

    const navigate = useNavigate();
    const muiTheme = useMuiTheme();
    const { mode } = useTheme();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
    };

    const initializeCharts = () => {
        if (emotionsChartRef.current) emotionsChartRef.current.destroy();
        if (topicsChartRef.current) topicsChartRef.current.destroy();

        const emotionsCtx = document.getElementById('emotionsChart') as HTMLCanvasElement;
        const topicsCtx = document.getElementById('topicsChart') as HTMLCanvasElement;

        if (emotionsCtx && topicsCtx && analysisResult) {
            const isDark = muiTheme.palette.mode === 'dark';
            const textColor = isDark ? '#f8fafc' : '#1e293b';

            emotionsChartRef.current = new Chart(emotionsCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(analysisResult.emotions),
                    datasets: [{
                        label: 'Intensity',
                        data: Object.values(analysisResult.emotions),
                        backgroundColor: (context) => {
                            const colors = ['#6366f1', '#ec4899', '#f59e0b', '#ef4444', '#10b981'];
                            return colors[context.dataIndex % colors.length];
                        },
                        borderRadius: 12,
                        hoverBackgroundColor: '#818cf8'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: isDark ? '#1e293b' : '#ffffff',
                            titleColor: isDark ? '#ffffff' : '#1e293b',
                            bodyColor: isDark ? '#cbd5e1' : '#475569',
                            borderColor: 'rgba(99, 102, 241, 0.2)',
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 12,
                            displayColors: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { color: textColor, font: { size: 11 } },
                            grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
                        },
                        x: {
                            ticks: { color: textColor, font: { size: 11 } },
                            grid: { display: false }
                        }
                    }
                }
            });

            topicsChartRef.current = new Chart(topicsCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(analysisResult.topics),
                    datasets: [{
                        data: Object.values(analysisResult.topics),
                        backgroundColor: ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#ef4444'],
                        hoverOffset: 15,
                        borderWidth: 0,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 8,
                                boxHeight: 8,
                                usePointStyle: true,
                                color: textColor,
                                padding: 20,
                                font: { size: 11 }
                            }
                        }
                    },
                    cutout: '75%'
                }
            });
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('files', file);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/analyze-testimony`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setAnalysisResult(data.analysis);
                setSnackbarOpen(true);
                setTimeout(() => setVisualizationModalOpen(true), 800);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const geocodeLocations = useCallback(async (locations: { [key: string]: any }) => {
        const geocoded: GeocodedLocation[] = [];
        for (const [name, data] of Object.entries(locations)) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}`);
                const results = await response.json();
                if (results && results.length > 0) {
                    geocoded.push({
                        name,
                        coordinates: [parseFloat(results[0].lat), parseFloat(results[0].lon)],
                        count: typeof data === 'object' ? data.count || 0 : data,
                        description: typeof data === 'object' ? data.description : `Mentioned`
                    });
                }
            } catch (e) { }
        }
        return geocoded;
    }, []);

    useEffect(() => {
        if (analysisResult?.locations) {
            geocodeLocations(analysisResult.locations).then(setGeocodedLocations);
        }
    }, [analysisResult, geocodeLocations]);

    useEffect(() => {
        if (visualizationModalOpen) setTimeout(initializeCharts, 100);
    }, [visualizationModalOpen, analysisResult, muiTheme.palette.mode]);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <Box className="min-h-screen gradient-mesh flex flex-col pt-24">
            <Navbar userName={user.name} onLogout={handleLogout} />

            <Box component="main" className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">
                    {/* Header */}
                    <motion.div variants={itemVariants} className="text-center space-y-6">
                        <Typography variant="h2" className="font-extrabold tracking-tight leading-tight md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 pb-2">
                            Uncover History's <br /> Emotional Pulse
                        </Typography>
                        {/* <Typography variant="h6" className="text-muted-foreground font-normal max-w-3xl mx-auto leading-relaxed">
                            Our AI deciphers raw testimonies to reveal the hidden threads of human experience across time and space. Discover the stories behind the data.
                        </Typography> */}
                    </motion.div>

                    {/* Upload Central Card */}
                    <motion.div variants={itemVariants} className="relative z-10">
                        <Paper className="glass rounded-[2.5rem] p-1.5 md:p-3 border shadow-2xl overflow-hidden max-w-4xl mx-auto">
                            <Box
                                className="p-8 md:p-12 rounded-[2.2rem] flex flex-col items-center text-center space-y-8 cursor-pointer relative transition-all duration-300"
                                onClick={() => fileInputRef.current?.click()}
                                component={motion.div}
                                whileHover={{ backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(99, 102, 241, 0.03)' }}
                            >
                                <Box className="absolute top-4 right-4 group">
                                    <MuiTooltip title="Analysis takes ~10-15 seconds" arrow>
                                        <InfoOutlinedIcon className="text-muted-foreground/30 group-hover:text-indigo-500 transition-colors" />
                                    </MuiTooltip>
                                </Box>

                                <Box className="relative">
                                    <AnimatePresence mode="wait">
                                        {uploading ? (
                                            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                <CircularProgress size={80} thickness={2} className="text-indigo-500" />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-indigo-500/10 p-6 rounded-3xl">
                                                <CloudUploadIcon className="text-indigo-500" sx={{ fontSize: 60 }} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Box>

                                <Box className="space-y-3">
                                    <Typography variant="h4" className="font-bold">
                                        {file ? file.name : "Import Testimony"}
                                    </Typography>
                                    <Typography variant="body1" className="text-muted-foreground">
                                        {file ? "Securely loaded and ready to process" : "Select a PDF, DOCX, or TXT document (Max 10MB)"}
                                    </Typography>
                                </Box>

                                <input ref={fileInputRef} type="file" hidden accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />

                                {file && !uploading && (
                                    <Box className="flex gap-4">
                                        <Button
                                            variant="outlined"
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="rounded-full px-8 py-3 border-foreground/10 hover:border-foreground/20 capitalize"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                            className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-12 py-3 text-lg font-bold shadow-indigo-500/20 shadow-xl capitalize hover:scale-105 transition-all"
                                        >
                                            Begin Analysis
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </motion.div>

                    {/* View Analysis Action */}
                    <AnimatePresence>
                        {analysisResult && !visualizationModalOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex justify-center"
                            >
                                <Button
                                    variant="contained"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => setVisualizationModalOpen(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-10 py-4 text-lg font-bold shadow-indigo-500/20 shadow-2xl capitalize hover:scale-105 transition-all gap-3"
                                >
                                    View Dashboard
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Features Grid */}
                    {/* <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                        {[
                            { icon: <PsychologyIcon sx={{ fontSize: 32 }} />, title: "Sentiment Mapping", desc: "Identify nuanced emotional states and sentiment shifts across the narrative arc of historical records." },
                            { icon: <PublicIcon sx={{ fontSize: 32 }} />, title: "Geospatial Intelligence", desc: "Our AI traces historical movements and maps out significant locations mentioned in testimonies." },
                            { icon: <TopicIcon sx={{ fontSize: 32 }} />, title: "Semantic Themes", desc: "Uncover core motifs, recurring subject matter, and hidden historical context automatically." }
                        ].map((feat, i) => (
                            <Box
                                key={i}
                                className="glass p-10 rounded-[2rem] space-y-6 hover:translate-y-[-8px] transition-all duration-300 group"
                            >
                                <Box className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                    {feat.icon}
                                </Box>
                                <Box className="space-y-3">
                                    <Typography variant="h5" className="font-bold tracking-tight">{feat.title}</Typography>
                                    <Typography variant="body1" className="text-muted-foreground leading-relaxed">{feat.desc}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </motion.div> */}
                </motion.div>
            </Box>

            {/* Dashboard Modal */}
            <Dialog
                open={visualizationModalOpen}
                onClose={() => setVisualizationModalOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    className: "glass rounded-[2rem]",
                    sx: {
                        backgroundImage: 'none',
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogTitle className="flex justify-between items-center px-8 py-6 border-b border-foreground/5">
                    <Box>
                        <Typography variant="h5" className="font-black">Deep Insights</Typography>
                        <Typography variant="body2" className="text-muted-foreground mt-1">
                            Analyzed results for <span className="text-indigo-400 font-bold">{analysisResult?.title || 'Unknown Source'}</span>
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setVisualizationModalOpen(false)} className="bg-foreground/5 hover:bg-foreground/10 transition-colors"><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent className="p-6 md:p-8 scrollbar-hide">
                    {analysisResult && (
                        <Box className="space-y-6">
                            {/* Summary Metrics */}
                            <Box className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Emotions', val: Object.keys(analysisResult.emotions).length, color: 'text-indigo-400' },
                                    { label: 'Locations', val: Object.keys(analysisResult.locations).length, color: 'text-pink-400' },
                                    { label: 'Topics', val: Object.keys(analysisResult.topics).length, color: 'text-emerald-400' },
                                    { label: 'People', val: analysisResult.people_mentioned.length, color: 'text-orange-400' }
                                ].map((m, i) => (
                                    <Box key={i} className="bg-foreground/5 p-4 rounded-2xl border border-foreground/5 text-center transition-all hover:bg-foreground/10">
                                        <Typography variant="h5" className={`font-black ${m.color}`}>{m.val}</Typography>
                                        <Typography variant="caption" className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">{m.label}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Column Group */}
                                <Box className="lg:col-span-8 flex flex-col gap-6">
                                    {/* Charts Row */}
                                    <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Paper className="p-6 glass rounded-2xl border-none shadow-none">
                                            <Typography variant="subtitle1" className="font-bold mb-4 flex items-center gap-2">
                                                <PsychologyIcon className="text-indigo-400" /> Sentiment Profile
                                            </Typography>
                                            <Box className="h-48"><canvas id="emotionsChart"></canvas></Box>
                                        </Paper>
                                        <Paper className="p-6 glass rounded-2xl border-none shadow-none">
                                            <Typography variant="subtitle1" className="font-bold mb-4 flex items-center gap-2">
                                                <TopicIcon className="text-emerald-400" /> Focus Domains
                                            </Typography>
                                            <Box className="h-48"><canvas id="topicsChart"></canvas></Box>
                                        </Paper>
                                    </Box>

                                    {/* Map Section */}
                                    <Paper className="p-6 glass rounded-2xl border-none shadow-none">
                                        <Box className="flex justify-between items-center mb-4">
                                            <Typography variant="subtitle1" className="font-bold flex items-center gap-2">
                                                <PublicIcon className="text-red-400" /> Historical Trajectory
                                            </Typography>
                                            <Box className="flex gap-2">
                                                <Button size="small" onClick={() => setShowEvents(!showEvents)} variant={showEvents ? 'contained' : 'text'} className="rounded-full px-4 capitalize min-w-[70px]">Events</Button>
                                                <Button size="small" onClick={() => setShowMovements(!showMovements)} variant={showMovements ? 'contained' : 'text'} className="rounded-full px-4 capitalize min-w-[70px]">Flow</Button>
                                            </Box>
                                        </Box>
                                        <Box className="h-[320px] rounded-xl overflow-hidden grayscale-[0.5] contrast-[1.1] border border-foreground/5">
                                            <MapContainer center={geocodedLocations.length > 0 ? geocodedLocations[0].coordinates : [20, 0]} zoom={4} className="h-full w-full">
                                                <TileLayer url={muiTheme.palette.mode === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                                                {showEvents && geocodedLocations.map((loc, i) => (
                                                    <Marker key={i} position={loc.coordinates} icon={divIcon({
                                                        html: `<div class="w-8 h-8 bg-indigo-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-[10px] transition-transform hover:scale-125">${i + 1}</div>`,
                                                        className: ''
                                                    })}>
                                                        <Tooltip><b>{loc.name}</b><br />{loc.description}</Tooltip>
                                                    </Marker>
                                                ))}
                                                {showMovements && geocodedLocations.length > 1 && <Polyline positions={geocodedLocations.map(l => l.coordinates)} color="#6366f1" opacity={0.4} dashArray="8, 8" />}
                                            </MapContainer>
                                        </Box>
                                    </Paper>
                                </Box>

                                {/* Right Column Sidebar */}
                                <Box className="lg:col-span-4 h-full">
                                    <Paper className="p-6 glass rounded-2xl border-none shadow-none h-full flex flex-col max-h-[700px]">
                                        <Typography variant="subtitle1" className="font-bold mb-4 flex items-center gap-2">
                                            <PersonIcon className="text-pink-400" /> Network Context
                                        </Typography>

                                        <Box className="flex-grow space-y-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-500/20">
                                            <Box className="bg-indigo-500/5 p-5 rounded-xl border border-indigo-500/10">
                                                <Typography variant="caption" className="text-indigo-400 font-extrabold uppercase tracking-[0.2em] block mb-3 text-[9px]">The Narrator</Typography>
                                                <Box className="space-y-3">
                                                    {Object.entries(analysisResult.writer_info).map(([k, v]) => (
                                                        <Box key={k}>
                                                            <Typography variant="caption" className="text-muted-foreground capitalize font-bold text-[10px]">{k.replace('_', ' ')}</Typography>
                                                            <Typography variant="body2" className="font-medium text-[13px]">{String(v) || 'Not specified'}</Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>

                                            <Box>
                                                <Typography variant="caption" className="text-muted-foreground font-extrabold uppercase tracking-[0.2em] block mb-3 text-[9px]">Key Characters</Typography>
                                                <Box className="space-y-2">
                                                    {analysisResult.people_mentioned.slice(0, 10).map((person: any, i: number) => (
                                                        <Box key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-foreground/5 border border-transparent hover:border-indigo-500/20 hover:bg-foreground/10 transition-all cursor-default">
                                                            <Box className="w-9 h-9 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 font-bold text-sm">{person.name.charAt(0)}</Box>
                                                            <Box className="min-w-0">
                                                                <Typography variant="body2" className="font-bold text-[13px] truncate">{person.name}</Typography>
                                                                <Typography variant="caption" className="text-muted-foreground text-[11px] block truncate">{person.role} • {person.region}</Typography>
                                                            </Box>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={() => setSnackbarOpen(false)}>
                <Alert severity="success" variant="filled" className="rounded-2xl shadow-xl border-none bg-indigo-600">
                    Testimony processed successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Home;