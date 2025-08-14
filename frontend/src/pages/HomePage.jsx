import React from 'react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="bg-gradient-to-br from-pink-50 via-teal-50 to-white min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-teal-400">
          Welcome to Our OCR App
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Our OCR (Optical Character Recognition) application allows you to
          quickly and accurately extract text from images and PDF documents.
          Whether it's scanned paperwork, printed text, or handwritten notes,
          our tool processes them in seconds with high accuracy.
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
          <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-pink-500">📷 Image to Text</h3>
            <p className="text-gray-600 mt-2">
              Upload images (JPG, PNG) and instantly get editable, selectable text output.
            </p>
          </div>
          <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-teal-500">📄 PDF Support</h3>
            <p className="text-gray-600 mt-2">
              Extract text from single or multi-page PDFs while keeping the structure intact.
            </p>
          </div>
          <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-yellow-500">⚡ Fast & Accurate</h3>
            <p className="text-gray-600 mt-2">
              Our advanced OCR engine ensures quick processing with top-tier recognition accuracy.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <Link to="/ocr">
          <Button className='mt-10' size="lg" variant="primary">
            Try OCR Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
