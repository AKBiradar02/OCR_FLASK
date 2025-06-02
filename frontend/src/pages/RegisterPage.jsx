import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

const RegisterPage = ({ register, error, clearError }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setPasswordError('');
    setLocalError('');
    
    if (password !== password2) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      await register({ username, email, password, password2 });
      navigate('/login');
    } catch (err) {
      // Show more specific error message
      if (err.message?.includes('Cannot connect to server')) {
        setLocalError('Cannot connect to server. Please make sure the backend is running.');
      }
      // Other errors are handled in the register function
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
        
        {(error || localError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {localError || error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => {
              clearError();
              setLocalError('');
              setUsername(e.target.value);
            }}
            required
            autoFocus
          />
          
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              clearError();
              setLocalError('');
              setEmail(e.target.value);
            }}
            required
          />
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              clearError();
              setPasswordError('');
              setLocalError('');
              setPassword(e.target.value);
            }}
            required
          />
          
          <Input
            label="Confirm Password"
            type="password"
            value={password2}
            onChange={(e) => {
              clearError();
              setPasswordError('');
              setLocalError('');
              setPassword2(e.target.value);
            }}
            error={passwordError}
            required
          />
          
          <Button
            type="submit"
            fullWidth
            isLoading={loading}
            className="mt-4"
          >
            Register
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 