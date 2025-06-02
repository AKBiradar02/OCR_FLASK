import React, { useState, useRef } from 'react';
import Button from './Button';

const FileUpload = ({
  onFileSelect,
  accept = 'image/png, image/jpeg, application/pdf',
  maxSizeMB = 16,
  label = 'Upload a file',
}) => {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes

    if (file.size > maxSize) {
      setError(`File size exceeds the ${maxSizeMB}MB limit.`);
      setFileName('');
      return;
    }

    setError('');
    setFileName(file.name);
    onFileSelect(file);
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="mt-1 flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
        <div className="flex-1 border border-gray-300 rounded-md px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap text-gray-500">
          {fileName || 'No file selected'}
        </div>
        <Button
          type="button"
          variant="outline"
          className="ml-2"
          onClick={handleBrowseClick}
        >
          Browse
        </Button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-gray-500">
        Accepted file types: JPG, PNG, PDF (max: {maxSizeMB}MB)
      </p>
    </div>
  );
};

export default FileUpload; 