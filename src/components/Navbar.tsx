import React from 'react';
import { Box, IconButton, Typography, Button, Avatar, useTheme as useMuiTheme } from '@mui/material';
import { motion } from 'framer-motion';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTheme } from './ThemeProvider';

interface NavbarProps {
    userName?: string;
    onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userName, onLogout }) => {
    const { mode, toggleTheme } = useTheme();
    const muiTheme = useMuiTheme();

    return (
        <Box className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
            <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-6xl glass rounded-2xl flex items-center justify-between px-6 py-3 shadow-2xl pointer-events-auto border"
            >
                <Box className="flex items-center gap-3">
                    <motion.div 
                        whileHover={{ rotate: 15 }}
                        className="bg-indigo-500/10 p-2 rounded-xl"
                    >
                        <HistoryEduIcon className="text-indigo-500" fontSize="medium" />
                    </motion.div>
                    <Typography 
                        variant="h6" 
                        className="font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hidden sm:block leading-none"
                        sx={{ fontSize: '1.25rem' }}
                    >
                        HistoriSense
                    </Typography>
                </Box>

                <Box className="flex items-center gap-2 sm:gap-6">
                    <Box className="flex items-center gap-3">
                        <IconButton 
                            onClick={toggleTheme} 
                            className="bg-primary/10 hover:bg-primary/20 text-foreground border border-primary/10"
                            size="small"
                        >
                            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                        </IconButton>
                        
                        {userName && (
                            <Box className="flex items-center gap-2 pl-4 border-l border-foreground/10 h-8">
                                <Avatar 
                                    sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}
                                    className="shadow-sm"
                                >
                                    {userName.charAt(0)}
                                </Avatar>
                                <Typography 
                                    variant="body2" 
                                    className="hidden md:block font-bold"
                                >
                                    {userName}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Button
                        variant="outlined"
                        onClick={onLogout}
                        size="small"
                        startIcon={<LogoutIcon fontSize="small" />}
                        className="rounded-full px-5 border-foreground/10 hover:border-destructive/40 hover:bg-destructive/5 text-foreground transition-all"
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                        Logout
                    </Button>
                </Box>
            </motion.div>
        </Box>
    );
};

export default Navbar;
