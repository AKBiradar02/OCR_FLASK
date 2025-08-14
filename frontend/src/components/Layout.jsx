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

  const navLink = (path, label) => (
    <Link
      to={path}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${location.pathname === path
          ? 'bg-gradient-to-r from-pink-100 to-teal-100 text-gray-900'
          : 'text-gray-700 hover:text-gray-900 hover:bg-pink-50'
        }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-50 via-teal-50 to-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-teal-400"
              >
                OCR App
              </Link>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex space-x-4">
              {navLink('/', 'Home')}
              {isAuthenticated && (
                <>
                  {navLink('/ocr', 'OCR')}
                  {navLink('/results', 'Results')}
                </>
              )}
            </nav>

            {/* Auth Buttons */}
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

      {/* Main */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
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
