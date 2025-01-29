import React, { useState } from 'react';

const PreviewPage = ({ csvData, columnMapping, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleImport = async () => {
    setLoading(true);

    // Map CSV data to database column names
    const mappedData = csvData.map((row) => {
      const mappedRow = {};
      Object.keys(columnMapping).forEach((csvColumn) => {
        if (columnMapping[csvColumn]) {
          mappedRow[columnMapping[csvColumn]] = row[csvColumn] || null;
        }
      });
      return mappedRow;
    });

    // Send data to the backend
    try {
      const response = await fetch('http://localhost:4000/department/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mappedData }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        console.log(result.message);
      } else {
        setSuccess(false);
        console.error(result.error);
      }
    } catch (err) {
      setSuccess(false);
      console.error('Error importing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const mappedHeaders = Object.keys(columnMapping).filter(
    (csvColumn) => columnMapping[csvColumn]
  );

  // Limit to 10 rows for preview
  const previewData = csvData.slice(0, 10);
  const totalRows = csvData.length;
  const hasMoreRows = totalRows > 10;

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Preview Import</h1>
      <p className="text-gray-600 mb-4">
        Below is a preview of your data after mapping. Please verify before proceeding.
      </p>

      {success === false && (
        <p className="text-red-600 font-semibold mb-2">Error importing data. Please try again.</p>
      )}
      {success === true && (
        <p className="text-green-600 font-semibold mb-2">Data imported successfully!</p>
      )}

      {/* Row count summary */}
      <p className="text-sm text-gray-600 mb-2">
        Showing {hasMoreRows ? "10" : totalRows} of {totalRows} rows
      </p>

      <div className="bg-white shadow-md rounded-lg w-full max-w-4xl overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-500 text-white">
              {mappedHeaders.map((header, index) => (
                <th key={index} className="p-3 text-left">{columnMapping[header]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b hover:bg-gray-50">
                {mappedHeaders.map((header, colIndex) => (
                  <td key={colIndex} className="p-3">{row[header] || 'NULL'}</td>
                ))}
              </tr>
            ))}
            {/* Show "..." row if there are more than 10 rows */}
            {hasMoreRows && (
              <tr className="border-b hover:bg-gray-50">
                {mappedHeaders.map((_, colIndex) => (
                  <td key={colIndex} className="p-3 font-semibold">...</td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex space-x-4">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
        >
          Back to Mapping
        </button>
        <button
          onClick={handleImport}
          disabled={loading}
          className={`px-6 py-3 font-semibold rounded-lg transition-all ${loading
              ? 'bg-gray-500 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          {loading ? 'Importing...' : 'Submit Import'}
        </button>
      </div>
    </div>
  );
};

export default PreviewPage;