import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from './Button';

const Layout = ({ children, isAuthenticated, username, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold text-blue-600">OCR App</Link>
            </div>
            
            <nav className="hidden md:flex space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Home
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link 
                    to="/ocr" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/ocr' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    OCR
                  </Link>
                  
                  <Link 
                    to="/results" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/results' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    Results
                  </Link>
                </>
              )}
            </nav>
            
            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">Welcome, {username}</span>
                  <Button size="sm" variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link to="/login">
                    <Button size="sm" variant="outline">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" variant="primary">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            OCR App &copy; {new Date().getFullYear()} - Extract text from images and PDFs
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 