import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TextField,
  // Checkbox
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import loginImage from "../assets/images/login.webp";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      // Redirect based on user role
      if (user.role === 'museum') {
        navigate('/museum-home', { replace: true });
      } else if (user.role === 'individual') {
        navigate('/user-home', { replace: true });
      } else {
        navigate('/login', { replace: true }); // Fallback if role is undefined
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();
      if (response.ok && data.success === true) {
        console.log('Login successful:', data);

        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          
          // Assuming backend returns user info with role
          const user = {
            name: data.name || email.split('@')[0], // Fallback to email prefix if no name
            role: data.role // Expecting 'museum' or 'individual' from backend
          };
          localStorage.setItem('user', JSON.stringify(user));

          // Redirect based on user role
          if (data.role === 'museum') {
            navigate('/museum-home', { replace: true });
          } else if (data.role === 'individual') {
            navigate('/user-home', { replace: true });
          } else {
            setError('Invalid user role received');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return;
          }
        } else {
          console.error('JWT token not received from server');
          setError('Authentication failed. No token received.');
          return;
        }
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="bg-white rounded-xl shadow-2xl flex flex-col md:flex-row w-full max-w-4xl">
        {/* Left Side - Image */}
        <div className="w-full md:w-1/2 hidden md:block">
          <img
            src={loginImage}
            alt="Login Image"
            className="object-cover w-full h-full rounded-l-xl"
          />
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Please sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 text-center">{error}</p>}
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

            {/* <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm">
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="text-indigo-600"
                  size="small"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-indigo-600 text-sm hover:underline">
                Forgot Password?
              </a>
            </div> */}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
            >
              <LoginIcon />
              <span>Sign In</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1">
              <button
                type="button"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Google
              </button>
            </div>

            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-600 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;