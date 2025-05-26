// ModalWithLoader.jsx
import React from 'react';

const ModalWithLoader = ({ isOpen, onClose, getMemberTrendsModal }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>

        {/* Modal Content */}
        <h2 className="text-lg font-semibold mb-4 text-center">There is some server issue from N8N. Please try again to fetch data.</h2>
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <button
          onClick={() => getMemberTrendsModal()}
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ModalWithLoader;
