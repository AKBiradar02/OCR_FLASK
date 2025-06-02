import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import { useOCR } from '../hooks/useOCR';

const ResultDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchResult, deleteResult, currentResult, loading, error } = useOCR();
  const [copied, setCopied] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!id || id === 'undefined') {
      setLocalError('Invalid result ID');
      return;
    }
    
    fetchResult(id).catch(err => {
      console.error('Error fetching result:', err);
    });
  }, [id, fetchResult]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      await deleteResult(id);
      navigate('/results');
    }
  };

  const handleCopyText = () => {
    if (currentResult?.text_content || currentResult?.text) {
      const textToCopy = currentResult.text_content || currentResult.text;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Unknown date';
    }
  };

  // Show error if ID is invalid
  if (localError) {
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md mb-4">
          {localError}
        </div>
        <Link to="/results">
          <Button variant="outline">Back to Results</Button>
        </Link>
      </div>
    );
  }

  if (loading && !currentResult) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md mb-4">
          {error}
        </div>
        <Link to="/results">
          <Button variant="outline">Back to Results</Button>
        </Link>
      </div>
    );
  }

  if (!currentResult) {
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">Result not found</p>
          <Link to="/results">
            <Button variant="outline">Back to Results</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get the text content from the appropriate field
  const textContent = currentResult.text_content || currentResult.text || '';

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">{currentResult.filename}</h1>
            <p className="text-gray-500">
              Processed on {formatDate(currentResult.timestamp)}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCopyText}>
              {copied ? 'Copied!' : 'Copy Text'}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
            <Link to="/results">
              <Button variant="secondary">Back</Button>
            </Link>
          </div>
        </div>

        <div className="border border-gray-200 rounded-md bg-gray-50 p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Extracted Text</h2>
          <div className="bg-white border border-gray-300 rounded-md p-4 max-h-96 overflow-y-auto whitespace-pre-wrap">
            {textContent || 'No text extracted'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDetailPage; 