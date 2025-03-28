import { useState } from 'react';
import { TextField, Checkbox, Select, MenuItem } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LockClockIcon from '@mui/icons-material/LockClock';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import signupImage from "../assets/images/signup.jpg";

import { validateEmail, validatePassword, confirmPasswordMatch, validateFullName, validateUserType, validateTerms } from '../components/Validations';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateFullName(fullName)) {
      alert('Please enter a valid full name');
      return;
    }
  
    if (!validateEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }
  
    if (!validatePassword(password)) {
      alert('Password must be at least 8 characters long and include upper case, lower case, numbers, and special characters.');
      return;
    }
  
    if (!confirmPasswordMatch(password, confirmPassword)) {
      alert('Passwords do not match');
      return;
    }
  
    if (!validateUserType(userType)) {
      alert('Please select a user type');
      return;
    }
  
    if (!validateTerms(agreeToTerms)) {
      alert('Please agree to the Terms and Conditions');
      return;
    }
  
    try {
      const response = await fetch('http://127.0.0.1:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          userType,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert('Signup successful!');
        navigate('/login');
      } else {
        alert(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="bg-white rounded-xl shadow-2xl flex flex-col md:flex-row w-full max-w-4xl">
        {/* Left Side - Image */}
        <div className="w-full md:w-1/2 hidden md:block">
          <img
            src={signupImage}
            alt="Signup Image"
            className="object-cover w-full h-full rounded-l-xl"
          />
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full md:w-1/2 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 mt-2">Join HistoriSense today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <TextField
                fullWidth
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <PersonIcon className="text-gray-400 absolute left-3" />
                  ),
                  sx: {
                    pl: '40px',
                    '& input': {
                      padding: '12px 16px',
                    }
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '0.5rem',
                    '&:hover fieldset': {
                      borderColor: 'rgb(209, 213, 219)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1',
                      borderWidth: '1px',
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgb(209, 213, 219)',
                  }
                }}
              />
            </div>

            <div className="relative">
              <TextField
                fullWidth
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <EmailIcon className="text-gray-400 absolute left-3" />
                  ),
                  sx: {
                    pl: '40px',
                    '& input': {
                      padding: '12px 16px',
                    }
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '0.5rem',
                    '&:hover fieldset': {
                      borderColor: 'rgb(209, 213, 219)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1',
                      borderWidth: '1px',
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgb(209, 213, 219)',
                  }
                }}
              />
            </div>

            <div className="relative">
              <TextField
                fullWidth
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <LockIcon className="text-gray-400 absolute left-3" />
                  ),
                  sx: {
                    pl: '40px',
                    '& input': {
                      padding: '12px 16px',
                    }
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '0.5rem',
                    '&:hover fieldset': {
                      borderColor: 'rgb(209, 213, 219)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1',
                      borderWidth: '1px',
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgb(209, 213, 219)',
                  }
                }}
              />
            </div>

            <div className="relative">
              <TextField
                fullWidth
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <LockClockIcon className="text-gray-400 absolute left-3" />
                  ),
                  sx: {
                    pl: '40px',
                    '& input': {
                      padding: '12px 16px',
                    }
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '0.5rem',
                    '&:hover fieldset': {
                      borderColor: 'rgb(209, 213, 219)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1',
                      borderWidth: '1px',
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgb(209, 213, 219)',
                  }
                }}
              />
            </div>

            <div className="relative">
              <PeopleIcon className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
              <Select
                fullWidth
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                displayEmpty
                className="pl-12"
                sx={{
                  borderRadius: '0.5rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgb(209, 213, 219)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgb(209, 213, 219)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6366f1',
                    borderWidth: '1px',
                  },
                  height: '48px'
                }}
              >
                <MenuItem value="" disabled>Select User Type</MenuItem>
                <MenuItem value="individual">Individual User</MenuItem>
                <MenuItem value="museum">Museum Representative</MenuItem>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="text-indigo-600"
              />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-indigo-600 hover:underline">
                  Terms and Conditions
                </a>
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
            >
              <PersonAddIcon />
              <span>Create Account</span>
            </button>

            <p className="text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-indigo-600 hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;