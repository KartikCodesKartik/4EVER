// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-6">Oops! The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="inline-block px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
