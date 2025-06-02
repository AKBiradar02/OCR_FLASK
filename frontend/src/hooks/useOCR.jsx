import { useState, useCallback } from 'react';
import { ocrAPI } from '../services/api';

export function useOCR() {
  const [results, setResults] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ocrAPI.getResults();
      // Handle the API response correctly - it returns an object with 'results' property
      setResults(data || []);
    } catch (err) {
      console.error('Error fetching results:', err);
      const errorMessage = err.response?.data?.error || 'Failed to fetch results';
      setError(errorMessage);
      setResults([]); // Ensure results is always an array
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResult = useCallback(async (resultId) => {
    // Validate result ID before making the API call
    if (!resultId || resultId === 'undefined') {
      setError('Invalid result ID');
      setCurrentResult(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await ocrAPI.getResult(resultId);
      setCurrentResult(data);
    } catch (err) {
      console.error('Error fetching result:', err);
      const errorMessage = err.response?.data?.error || 'Failed to fetch result';
      setError(errorMessage);
      setCurrentResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const processFile = async (file) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ocrAPI.processFile(file);
      
      const processedResult = {
        id: data.result_id,
        filename: data.filename,
        timestamp: new Date().toISOString(),
        text_content: data.text
      };

      // Add to list of results
      setResults((prevResults) => [processedResult, ...(prevResults || [])]);
      setCurrentResult(processedResult);
      return processedResult;
    } catch (err) {
      console.error('Error processing file:', err);
      const errorMessage = err.response?.data?.error || 'Failed to process file';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteResult = async (resultId) => {
    // Validate result ID before making the API call
    if (!resultId || resultId === 'undefined') {
      setError('Invalid result ID');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await ocrAPI.deleteResult(resultId);
      
      // Remove from list of results
      setResults((prevResults) => (prevResults || []).filter(result => result.id !== resultId));
      
      // Clear current result if it was just deleted
      if (currentResult && currentResult.id === resultId) {
        setCurrentResult(null);
      }
    } catch (err) {
      console.error('Error deleting result:', err);
      const errorMessage = err.response?.data?.error || 'Failed to delete result';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    results,
    currentResult,
    loading,
    error,
    processFile,
    fetchResults,
    fetchResult,
    deleteResult,
    clearError
  };
} 