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
  Alert,
  useTheme as useMuiTheme,
  TextField,
  Avatar
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TopicIcon from '@mui/icons-material/Topic';
import PublicIcon from '@mui/icons-material/Public';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import Chart from 'chart.js/auto';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25 } }
};

const MuseumHome: React.FC = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [visualizationModalOpen, setVisualizationModalOpen] = useState(false);
  const emotionsChartRef = useRef<Chart | null>(null);
  const topicsChartRef = useRef<Chart | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [selectedTestimony, setSelectedTestimony] = useState<Testimony | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [testimonyToDelete, setTestimonyToDelete] = useState<string | null>(null);
  const [geocodedLocations, setGeocodedLocations] = useState<GeocodedLocation[]>([]);

  const navigate = useNavigate();
  const muiTheme = useMuiTheme();

  const fetchTestimonies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/museum-testimonies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
        return;
      }
      const data = await response.json();
      setTestimonies(data.testimonies || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchTestimonies(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files).slice(0, 5));
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      await fetch(`${import.meta.env.VITE_API_URL}/analyze-testimony`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token!}` },
        body: formData
      });
      setFiles([]);
      setUploadModalOpen(false);
      fetchTestimonies();
      setSnackbarOpen(true);
    } catch (e) {} finally { setUploading(false); }
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
            description: typeof data === 'object' ? data.description : ''
          });
        }
      } catch (e) {}
    }
    return geocoded;
  }, []);

  useEffect(() => {
    if (selectedTestimony?.locations) {
      geocodeLocations(selectedTestimony.locations).then(setGeocodedLocations);
    }
  }, [selectedTestimony, geocodeLocations]);

  const initializeCharts = () => {
    if (emotionsChartRef.current) emotionsChartRef.current.destroy();
    if (topicsChartRef.current) topicsChartRef.current.destroy();
    const emotionsCtx = document.getElementById('emotionsChart') as HTMLCanvasElement;
    const topicsCtx = document.getElementById('topicsChart') as HTMLCanvasElement;
    if (emotionsCtx && topicsCtx && selectedTestimony) {
      const isDark = muiTheme.palette.mode === 'dark';
      const textColor = isDark ? '#f8fafc' : '#1e293b';
      emotionsChartRef.current = new Chart(emotionsCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(selectedTestimony.emotions),
          datasets: [{ data: Object.values(selectedTestimony.emotions), backgroundColor: ['#6366f1', '#ec4899', '#f59e0b', '#ef4444', '#10b981'], borderRadius: 6 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, ticks: { color: textColor } }, x: { ticks: { color: textColor } } } }
      });
      topicsChartRef.current = new Chart(topicsCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(selectedTestimony.topics),
          datasets: [{ data: Object.values(selectedTestimony.topics), backgroundColor: ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#ef4444'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: textColor } } }, cutout: '70%' }
      });
    }
  };

  useEffect(() => {
    if (visualizationModalOpen) setTimeout(initializeCharts, 100);
  }, [visualizationModalOpen, selectedTestimony, muiTheme.palette.mode]);

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Aggregated Stats
  const totalTestimonies = testimonies.length;
  const uniqueLocations = new Set(testimonies.flatMap(t => Object.keys(t.locations))).size;
  const totalEntities = testimonies.reduce((acc, t) => acc + t.people_mentioned.length, 0);

  return (
    <Box className="min-h-screen gradient-mesh pt-24 pb-12">
      <Navbar userName={user.name} onLogout={handleLogout} />

      <Box component="main" className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        {/* Header Section */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col md:flex-row justify-between items-end gap-6">
            <Box className="space-y-2">
                <Typography variant="h3" className="font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500">Museum Archive</Typography>
                <Typography variant="h6" className="text-muted-foreground font-light">Institutional Intelligence & Historical Research</Typography>
            </Box>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setUploadModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-8 py-4 shadow-xl shadow-indigo-500/20 font-bold text-lg"
            >
                Archive Records
            </Button>
        </motion.div>

        {/* Dynamic Stats Dashboard */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { label: 'Total Records', val: totalTestimonies, icon: <HistoryIcon/>, color: 'text-indigo-400' },
                { label: 'Network Entities', val: totalEntities, icon: <PeopleIcon/>, color: 'text-pink-400' },
                { label: 'Geographic Span', val: uniqueLocations, icon: <PublicIcon/>, color: 'text-emerald-400' },
                { label: 'Institutions', val: 1, icon: <PublicIcon/>, color: 'text-orange-400' }
            ].map((stat, i) => (
                <Paper key={i} className="glass p-6 rounded-3xl border border-white/5 flex items-center gap-6">
                    <Box className={`${stat.color} bg-white/5 p-4 rounded-2xl`}>{stat.icon}</Box>
                    <Box>
                        <Typography variant="h4" className="font-black leading-none">{stat.val}</Typography>
                        <Typography variant="caption" className="text-muted-foreground font-bold uppercase tracking-widest">{stat.label}</Typography>
                    </Box>
                </Paper>
            ))}
        </motion.div>

        {/* Master Table */}
        <motion.div variants={itemVariants}>
            <Paper className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                <Table>
                    <TableHead>
                        <TableRow className="bg-white/5">
                            <TableCell className="font-bold py-6 pl-8">Knowledge Record</TableCell>
                            <TableCell className="font-bold">Provenance Date</TableCell>
                            <TableCell className="font-bold">Format</TableCell>
                            <TableCell className="font-bold" align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <AnimatePresence mode="popLayout">
                            {testimonies.map((testimony, i) => (
                                <TableRow key={testimony.filename} component={motion.tr} variants={itemVariants} className="hover:bg-white/5 transition-colors group">
                                    <TableCell className="py-6 pl-8">
                                        <Box className="flex items-center gap-4">
                                            <Avatar sx={{ bgcolor: 'indigo.500/10', color: 'indigo.400' }}>
                                                {testimony.title.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body1" className="font-bold text-foreground">{testimony.title.replace(/\.[^/.]+$/, "").replace(/_/g, ' ')}</Typography>
                                                <Typography variant="caption" className="text-muted-foreground italic">Source MD5: {testimony.filename.substring(0, 12)}...</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{new Date(testimony.upload_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</TableCell>
                                    <TableCell>
                                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                                            {testimony.file_type}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right" className="pr-8">
                                        <IconButton onClick={() => { setSelectedTestimony(testimony); setVisualizationModalOpen(true); }} className="text-indigo-400 hover:bg-indigo-400/10 transition-transform group-hover:scale-110">
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton onClick={() => { setTestimonyToDelete(testimony.filename); setDeleteConfirmOpen(true); }} className="text-pink-400 hover:bg-pink-400/10 ml-2">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
                {testimonies.length === 0 && (
                    <Box className="p-20 text-center space-y-4">
                        <HistoryIcon className="text-muted-foreground/20" sx={{ fontSize: 80 }} />
                        <Typography variant="h6" className="text-muted-foreground">The archive is currently empty.</Typography>
                        <Button onClick={() => setUploadModalOpen(true)} className="text-indigo-500">Initiate First Import</Button>
                    </Box>
                )}
            </Paper>
        </motion.div>
      </Box>

      {/* Analysis Modal */}
      <Dialog open={visualizationModalOpen} onClose={() => setVisualizationModalOpen(false)} maxWidth="lg" fullWidth PaperProps={{ className: "glass rounded-[3rem]", sx: { backgroundImage: 'none' } }}>
        <DialogTitle className="flex justify-between items-center p-8 border-b border-white/5">
            <Box>
                <Typography variant="h4" className="font-black">Deep Insights</Typography>
                <Typography variant="body2" className="text-muted-foreground mt-1">Record Intelligence: {selectedTestimony?.title}</Typography>
            </Box>
            <IconButton onClick={() => setVisualizationModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent className="p-8">
            {selectedTestimony && (
                <Box className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Paper className="p-8 glass rounded-3xl border-none shadow-none">
                        <Typography variant="h6" className="font-bold flex items-center gap-2 mb-8"><PsychologyIcon className="text-indigo-400"/> Sentiment Arc</Typography>
                        <Box className="h-64"><canvas id="emotionsChart"></canvas></Box>
                    </Paper>
                    <Paper className="p-8 glass rounded-3xl border-none shadow-none">
                        <Typography variant="h6" className="font-bold flex items-center gap-2 mb-8"><TopicIcon className="text-emerald-400"/> Focus Groups</Typography>
                        <Box className="h-64"><canvas id="topicsChart"></canvas></Box>
                    </Paper>
                    <Box className="lg:col-span-2">
                        <Paper className="p-8 glass rounded-3xl border-none shadow-none">
                            <Typography variant="h6" className="font-bold flex items-center gap-2 mb-8"><PublicIcon className="text-red-400"/> Spatial Trajectory</Typography>
                            <Box className="h-[400px] rounded-[1.5rem] overflow-hidden">
                                <MapContainer center={geocodedLocations.length > 0 ? geocodedLocations[0].coordinates : [20, 0]} zoom={4} className="h-full w-full">
                                    <TileLayer url={muiTheme.palette.mode === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                                    {geocodedLocations.map((loc, i) => (
                                        <Marker key={i} position={loc.coordinates} icon={divIcon({
                                            html: `<div class="w-8 h-8 bg-indigo-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs">${i+1}</div>`,
                                            className: ''
                                        })}>
                                            <Tooltip><b>{loc.name}</b><br/>{loc.description}</Tooltip>
                                        </Marker>
                                    ))}
                                    {geocodedLocations.length > 1 && <Polyline positions={geocodedLocations.map(l => l.coordinates)} color="#6366f1" opacity={0.4} />}
                                </MapContainer>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ className: "glass rounded-3xl" }}>
          <Box className="p-10 text-center space-y-6">
              <Box className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto text-pink-500"><DeleteIcon sx={{ fontSize: 40 }} /></Box>
              <Box>
                  <Typography variant="h5" className="font-black">Permanent Removal</Typography>
                  <Typography variant="body2" className="text-muted-foreground mt-2">Are you sure you want to delete this historical record? This action cannot be undone.</Typography>
              </Box>
              <Box className="flex gap-4 pt-4">
                  <Button fullWidth onClick={() => setDeleteConfirmOpen(false)} className="rounded-xl py-3 border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">Cancel</Button>
                  <Button fullWidth onClick={async () => {
                      const token = localStorage.getItem('token');
                      await fetch(`${import.meta.env.VITE_API_URL}/museum-testimony/${testimonyToDelete}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token!}` } });
                      setTestimonies(testimonies.filter(t => t.filename !== testimonyToDelete));
                      setDeleteConfirmOpen(false);
                  }} variant="contained" className="bg-pink-600 hover:bg-pink-700 rounded-xl py-3 font-bold shadow-pink-500/20 shadow-lg">Confirm Delete</Button>
              </Box>
          </Box>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
          <Alert severity="success" className="rounded-2xl bg-indigo-600 text-white font-bold">Archive Successfully Processed</Alert>
      </Snackbar>
    </Box>
  );
};

export default MuseumHome;