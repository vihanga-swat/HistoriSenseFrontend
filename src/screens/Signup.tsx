import { useState } from 'react';
import { 
    TextField, 
    Checkbox, 
    Select, 
    MenuItem, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Box, 
    Typography, 
    InputAdornment,
    FormControl,
    InputLabel,
    CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { motion, AnimatePresence } from 'framer-motion';
import signupImage from "../assets/images/Signup.png";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { useNavigate, Link } from 'react-router-dom';
import { 
    validateEmail, 
    validatePassword, 
    confirmPasswordMatch, 
    validateFullName, 
    validateUserType, 
    validateTerms 
} from '../components/Validations';

const Signup = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userType, setUserType] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!validateFullName(fullName)) return setError('Please provide a legitimate full name.');
        if (!validateEmail(email)) return setError('The provided email format is invalid.');
        if (!validatePassword(password)) return setError('Security requirement: Password too weak.');
        if (!confirmPasswordMatch(password, confirmPassword)) return setError('Secret keys do not match.');
        if (!validateUserType(userType)) return setError('Please define your institutional role.');
        if (!validateTerms(agreeToTerms)) return setError('Terms acknowledgement required.');

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password, userType }),
            });
            if (response.ok) navigate('/login');
            else {
                const data = await response.json();
                setError(data.message || 'Enrollment rejected.');
            }
        } catch (err) { setError('Network gateway timeout.'); } finally { setLoading(false); }
    };

    return (
        <Box className="min-h-screen grid grid-cols-1 lg:grid-cols-12 gradient-mesh overflow-hidden">
            {/* Form Side */}
            <Box className="lg:col-span-5 flex items-center justify-center p-8 md:p-12 lg:p-20 relative overflow-y-auto">
                <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-lg space-y-10"
                >
                    <Box className="space-y-3">
                        <Typography variant="h3" className="font-black tracking-tight">Enrollment Request</Typography>
                        <Typography variant="h6" className="text-muted-foreground font-light leading-relaxed">Prepare your digital credentials to join the HistoriSense research cooperative.</Typography>
                    </Box>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-bold">
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Box className="space-y-5">
                            <TextField fullWidth label="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} variant="outlined" InputProps={{ startAdornment: (<InputAdornment position="start"><PersonIcon className="text-indigo-500 mr-2" /></InputAdornment>), sx: { borderRadius: '1rem' }}} />
                            <TextField fullWidth label="Contact Channel (Email)" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} variant="outlined" InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon className="text-indigo-500 mr-2" /></InputAdornment>), sx: { borderRadius: '1rem' }}} />
                            
                            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <TextField label="Security Key" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} variant="outlined" InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon className="text-indigo-500 mr-2" /></InputAdornment>), sx: { borderRadius: '1rem' }}} />
                                <TextField label="Verify Key" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} variant="outlined" InputProps={{ sx: { borderRadius: '1rem' }}} />
                            </Box>

                            <FormControl variant="outlined" fullWidth required>
                                <InputLabel>Operational Capacity</InputLabel>
                                <Select
                                    value={userType}
                                    onChange={(e) => setUserType(e.target.value)}
                                    label="Operational Capacity"
                                    sx={{ borderRadius: '1rem' }}
                                    startAdornment={<InputAdornment position="start"><PeopleIcon className="text-indigo-500 mr-2" /></InputAdornment>}
                                >
                                    <MenuItem value="individual">Independent Researcher</MenuItem>
                                    <MenuItem value="museum">Institutional Curator</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Box className="flex items-center gap-2">
                            <Checkbox checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} sx={{ color: 'indigo.500', '&.Mui-checked': { color: 'indigo.500' } }} />
                            <Typography variant="body2" className="text-muted-foreground">
                                I verify compliance with the <button type="button" onClick={() => setTermsOpen(true)} className="text-indigo-500 font-black hover:underline">Code of Ethics</button>
                            </Typography>
                        </Box>

                        <Button fullWidth size="large" type="submit" disabled={loading} variant="contained" className="bg-indigo-600 hover:bg-indigo-700 h-16 rounded-2xl text-xl font-black shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-indigo-500/30">
                            {loading ? <CircularProgress size={28} color="inherit" /> : <Box className="flex items-center gap-3"><span>Submit Submission</span><PersonAddIcon /></Box>}
                        </Button>

                        <Box className="text-center">
                            <Typography variant="body1" className="text-muted-foreground">Already documented? <Link to="/login" className="text-indigo-500 font-black hover:text-indigo-400 transition-colors">Sign In</Link></Typography>
                        </Box>
                    </form>
                </motion.div>
            </Box>

            {/* Visual Side */}
            <Box className="hidden lg:flex lg:col-span-7 relative flex-col justify-end p-20 overflow-hidden">
                <motion.img initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5 }} src={signupImage} alt="Archive Context" className="absolute inset-0 w-full h-full object-cover brightness-[0.6]" />
                <Box className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-900/20 to-transparent" />
                
                <Box className="relative z-10 max-w-2xl text-white space-y-6">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                        <Typography variant="h2" className="font-black tracking-tight leading-none text-7xl">
                            Preserve The <span className="text-pink-400">Voices</span>
                        </Typography>
                    </motion.div>
                </Box>
            </Box>

            {/* Terms Modal */}
            <Dialog open={termsOpen} onClose={() => setTermsOpen(false)} maxWidth="sm" fullWidth PaperProps={{ className: "glass rounded-[2rem]" }}>
                <DialogTitle className="font-black p-8 text-2xl">Research Protocol</DialogTitle>
                <DialogContent dividers className="p-8 space-y-6">
                    <Box className="space-y-4">
                        <Typography variant="h6" className="font-bold text-indigo-400">Institutional Responsibility</Typography>
                        <Typography variant="body2" className="text-muted-foreground leading-relaxed">All users agree to handle historical records with the utmost sensitivity and scientific accuracy.</Typography>
                        <Typography variant="h6" className="font-bold text-indigo-400">Digital Sovereignty</Typography>
                        <Typography variant="body2" className="text-muted-foreground leading-relaxed">Your data remains your intellectual property. Our AI processing is strictly analytical and non-appropriative.</Typography>
                    </Box>
                </DialogContent>
                <DialogActions className="p-6">
                    <Button onClick={() => setTermsOpen(false)} className="px-6 rounded-xl">Dismiss</Button>
                    <Button variant="contained" onClick={() => { setAgreeToTerms(true); setTermsOpen(false); }} className="bg-indigo-600 rounded-xl px-10 py-3 font-bold shadow-xl">Acknowledge</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Signup;