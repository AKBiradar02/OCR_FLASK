import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const HomePage = ({ isAuthenticated }) => {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-12 md:px-12 text-center lg:text-left">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="mt-12 lg:mt-0">
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
                Extract Text from <span className="text-blue-600">Images & PDFs</span>
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Our OCR application allows you to quickly extract text from images and PDF files.
                Upload your file and get the text content in seconds.
              </p>
              
              {isAuthenticated ? (
                <Link to="/ocr">
                  <Button size="lg">Start OCR Processing</Button>
                </Link>
              ) : (
                <div className="flex flex-col md:flex-row justify-center lg:justify-start gap-2">
                  <Link to="/login">
                    <Button size="lg" variant="primary">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="lg" variant="outline">Register</Button>
                  </Link>
                </div>
              )}
            </div>
            
            <div className="mb-12 lg:mb-0">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-4">Features</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Support for images (JPG, PNG) and PDFs
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    High accuracy text recognition
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Save and manage your results
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Simple and intuitive interface
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 