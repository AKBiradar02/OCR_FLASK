import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

const LoginPage = ({ login, error, clearError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    
    try {
      setLoading(true);
      await login({ username, password });
      navigate('/');
    } catch (err) {
      // Show more specific error message
      if (err.message?.includes('Cannot connect to server')) {
        setLocalError('Cannot connect to server. Please make sure the backend is running.');
      }
      // Error is handled in the login function
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        
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
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              clearError();
              setLocalError('');
              setPassword(e.target.value);
            }}
            required
          />
          
          <Button
            type="submit"
            fullWidth
            isLoading={loading}
            className="mt-4"
          >
            Login
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 