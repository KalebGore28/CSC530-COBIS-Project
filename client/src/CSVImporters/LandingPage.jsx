import React, { useState } from 'react';

const DepartmentLandingPage = ({ onUploadStart }) => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Import Department CSV</h1>
      <p>Use the button below to start importing department data from a CSV file.</p>
      <button
        onClick={onUploadStart}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Start Import
      </button>
    </div>
  );
};

export default DepartmentLandingPage;