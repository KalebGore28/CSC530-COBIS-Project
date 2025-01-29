import React from 'react';

const CSVImporterPage = ({ entityName, onUploadStart, onGenerateReport }) => {
  return (
    <div className="relative w-full p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Import {entityName} CSV</h1>
      <p className="text-gray-600 mb-6">
        Use the buttons below to import {entityName.toLowerCase()} data or generate a report.
      </p>
  
      <div className="flex space-x-4 justify-center">
        <button
          onClick={onUploadStart}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
        >
          Start Import
        </button>
  
        <button
          onClick={onGenerateReport}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default CSVImporterPage;