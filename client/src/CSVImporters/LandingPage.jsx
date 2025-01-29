import React from 'react';

const DepartmentLandingPage = ({ onUploadStart, onGenerateReport }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-10 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Import Department CSV</h1>
        <p className="text-gray-600 mb-6">
          Use the buttons below to import department data or generate a report.
        </p>

        <div className="flex space-x-4 justify-between">
          {/* Start Import Button */}
          <button
            onClick={onUploadStart}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            Start Import
          </button>

          {/* Generate Report Button */}
          <button
            onClick={onGenerateReport}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all"
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentLandingPage;