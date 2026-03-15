import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TextField,
  Typography,
  Box,
  Button,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import { motion, AnimatePresence } from 'framer-motion';
import loginImage from "../assets/images/Login.png";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'museum') navigate('/museum-home', { replace: true });
        else navigate('/user-home', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify({ name: data.name || email.split('@')[0], role: data.role }));
        if (data.role === 'museum') navigate('/museum-home', { replace: true });
        else navigate('/user-home', { replace: true });
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Connection lost. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen grid grid-cols-1 lg:grid-cols-12 gradient-mesh overflow-hidden">
      {/* Visual Identity Side */}
      <Box className="hidden lg:flex lg:col-span-7 relative flex-col justify-center items-center overflow-hidden h-full">
        <motion.img
          initial={{ scale: 1.2, filter: 'blur(10px)', opacity: 0 }}
          animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          src={loginImage}
          alt="Archive Entrance"
          className="absolute inset-0 w-full h-full object-cover grayscale-[0.3] contrast-[1.1] brightness-[0.7]"
        />
        <Box className="absolute inset-0 bg-gradient-to-tr from-indigo-950/90 via-indigo-900/40 to-transparent" />
        
        <Box className="relative z-10 p-16 max-w-2xl text-white space-y-8">
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white/10 backdrop-blur-md p-4 rounded-3xl w-fit">
                <HistoryEduIcon sx={{ fontSize: 48 }} />
            </motion.div>
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="space-y-4">
                <Typography variant="h1" className="font-black leading-none tracking-tight text-7xl">
                    Archive <br/> The <span className="text-indigo-400">Untold</span>
                </Typography>
                <Typography variant="h5" className="font-light text-slate-300">
                    HistoriSense uses advanced semantic AI to document and analyze the complex tapestry of historical testimonies.
                </Typography>
            </motion.div>
        </Box>
        
        {/* Animated Orbs */}
        <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} 
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[100px]" 
        />
      </Box>

      {/* Input Experience Side */}
      <Box className="lg:col-span-5 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-background relative">
        <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md space-y-12"
        >
            <Box className="space-y-3">
                <Typography variant="h3" className="font-black tracking-tight">Identity Vault</Typography>
                <Typography variant="h6" className="text-muted-foreground font-light">Enter your credentials to access the researcher dashboard.</Typography>
            </Box>

            <form onSubmit={handleSubmit} className="space-y-8">
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                            <Box className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2">
                                <Box className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                {error}
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Box className="space-y-6">
                    <TextField
                        fullWidth
                        label="Digital Identification (Email)"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        variant="outlined"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon className="text-indigo-500 mr-2" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: '1rem', bgcolor: 'white/5' }
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Access Token (Password)"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        variant="outlined"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon className="text-indigo-500 mr-2" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: '1rem', bgcolor: 'white/5' }
                        }}
                    />
                </Box>

                <Button
                    fullWidth
                    size="large"
                    type="submit"
                    disabled={loading}
                    variant="contained"
                    className="bg-indigo-600 hover:bg-indigo-700 h-16 rounded-2xl text-xl font-black shadow-2xl shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    {loading ? <CircularProgress size={28} color="inherit" /> : (
                        <Box className="flex items-center gap-3">
                            <span>Open Vault</span>
                            <LoginIcon />
                        </Box>
                    )}
                </Button>

                <Box className="pt-6 text-center">
                    <Typography variant="body1" className="text-muted-foreground">
                        No clearance? {' '}
                        <Link to="/signup" className="text-indigo-500 font-black hover:text-indigo-400 decoration-none transition-colors">
                            Request Enrollment
                        </Link>
                    </Typography>
                </Box>
            </form>
        </motion.div>
        
        {/* Mobile Logo */}
        <Box className="absolute top-8 left-8 lg:hidden">
            <HistoryEduIcon className="text-indigo-500" fontSize="large" />
        </Box>
      </Box>
    </Box>
  );
};

export default Login;