import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import Button from '../components/Button';
import { useOCR } from '../hooks/useOCR';

const OCRPage = () => {
  const [file, setFile] = useState(null);
  const { processFile, loading, error } = useOCR();
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      return;
    }
    
    try {
      const result = await processFile(file);
      navigate(`/results/${result.id}`);
    } catch (err) {
      console.error('Error processing file:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Upload Document for OCR</h1>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <FileUpload 
              onFileSelect={handleFileSelect}
              label="Select a document to extract text from"
              accept="image/png, image/jpeg, application/pdf"
              maxSizeMB={10}
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-md mb-6">
            <h3 className="font-medium text-blue-800 mb-2">Supported File Types</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Images (JPG, PNG)</li>
              <li>• PDF documents (single or multi-page)</li>
            </ul>
          </div>
          
          <Button
            type="submit"
            isLoading={loading}
            disabled={!file || loading}
            fullWidth
          >
            Process Document
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OCRPage; 