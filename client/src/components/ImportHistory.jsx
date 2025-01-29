import React, { useEffect, useState } from 'react';

const ImportHistory = ({ entityType }) => {
  const [importHistory, setImportHistory] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:4000/import-history?entity=${entityType}`)
      .then((res) => res.json())
      .then((data) => setImportHistory(data.slice(0, 5))) // Limit to latest 5 imports
      .catch((err) => console.error('Error fetching import history:', err));
  }, [entityType]);

  const formatLocalTime = (utcTimestamp) => {
    const date = new Date(utcTimestamp + 'Z'); // Force UTC parsing
    return date.toLocaleString(); // Convert to local time format
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{entityType} Import History</h2>

      {importHistory.length === 0 ? (
        <p className="text-gray-500 text-center">No recent imports found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4 text-left font-semibold">File Name</th>
                <th className="p-4 text-left font-semibold">Total Records</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Imported By</th>
                <th className="p-4 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {importHistory.map((importEntry, index) => (
                <tr
                  key={index}
                  className="border-b transition hover:bg-gray-50"
                >
                  <td className="p-4">{importEntry.file_name}</td>
                  <td className="p-4">{importEntry.total_records}</td>
                  <td
                    className={`p-4 font-semibold ${importEntry.import_status === 'Completed'
                      ? 'text-green-600'
                      : 'text-red-500'
                      }`}
                  >
                    {importEntry.import_status}
                  </td>
                  <td className="p-4">{importEntry.imported_by}</td>
                  <td className="p-4">
                    <td className="p-4">{formatLocalTime(importEntry.import_date)}</td>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Future Button to View Filtered Imports */}
      <div className="flex justify-end mt-2 space-x-4">
        <div className="mt-4 flex justify-end">
          <button
            className="px-5 py-2 bg-blue-300 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
            onClick={() => console.log(`Navigate to filtered import history for ${entityType}`)}
          >
            View Imports
          </button>
        </div>

        {/* Future Button to View All Imports */}
        <div className="mt-4 flex justify-end">
          <button
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
            onClick={() => console.log(`Navigate to full import history for ${entityType}`)}
          >
            View All Imports
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportHistory;