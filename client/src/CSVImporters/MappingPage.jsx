import React, { useState } from 'react';

const MappingPage = ({ csvData, headers, tableColumns, onMappingChange, onNext, onCancel }) => {
  const [columnMapping, setColumnMapping] = useState({});

  const handleMappingChange = (csvColumn, dbColumn) => {
    const newMapping = { ...columnMapping, [csvColumn]: dbColumn };
    setColumnMapping(newMapping);
    onMappingChange(newMapping);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Match Fields</h1>
      <div className="bg-white shadow-md rounded-lg w-full max-w-4xl overflow-clip">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-3 text-left">CSV Column Name</th>
              <th className="p-3 text-left">Department Fields</th>
              <th className="p-3 text-left">Examples from CSV</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((header, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-3">{header}</td>
                <td className="p-3">
                  <select
                    className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                    value={columnMapping[header] || ''}
                    onChange={(e) => handleMappingChange(header, e.target.value)}
                  >
                    <option value="">Not Used</option>
                    {tableColumns.map((col, idx) => (
                      <option key={idx} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  {csvData.slice(0, 3).map((row, idx) => (
                    <span key={idx} className="inline-block bg-gray-200 px-2 py-1 rounded-md text-sm mr-2">
                      {row[header] || 'NULL'}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Buttons Section */}
      <div className="mt-6 flex space-x-4">
        {/* Cancel Button - Calls onCancel prop to return to the department view */}
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
        >
          Cancel
        </button>

        {/* Preview Import Button */}
        <button
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
        >
          Preview Import
        </button>
      </div>
    </div>
  );
};

export default MappingPage;