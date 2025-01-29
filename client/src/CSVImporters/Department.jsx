import React, { useState } from 'react';
import DepartmentLandingPage from './LandingPage';
import UploadModal from '../modals/UploadModal';
import MappingPage from './MappingPage';
import PreviewPage from './PreviewPage';
import Papa from 'papaparse';

const Department = () => {
  const [showModal, setShowModal] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [step, setStep] = useState('landing'); // landing, mapping, preview

  const handleOnCancel = () => {
    setStep('landing');
  };

  const handleFileUpload = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setHeaders(Object.keys(results.data[0] || {}));
        setCsvData(results.data);
        setShowModal(false);
        setStep('mapping');
      },
    });

    // Fetch table columns
    fetch('http://localhost:4000/department/column-names')
      .then((res) => res.json())
      .then((data) => setTableColumns(data.columns))
      .catch((err) => console.error('Error fetching table columns:', err));
  };

  return (
    <div>
      {step === 'landing' && (
        <>
          <DepartmentLandingPage onUploadStart={() => setShowModal(true)} />
          {showModal && (
            <UploadModal
              onClose={() => setShowModal(false)}
              onFileUpload={handleFileUpload}
            />
          )}
        </>
      )}

      {step === 'mapping' && (
        <MappingPage
          csvData={csvData}
          headers={headers}
          tableColumns={tableColumns}
          onMappingChange={(mapping) => setColumnMapping(mapping)}
          onNext={() => setStep('preview')}
          onCancel={handleOnCancel}
        />
      )}

      {step === 'preview' && (
        <PreviewPage
          csvData={csvData}
          columnMapping={columnMapping}
          onBack={() => setStep('mapping')}
          onProceed={() => {
            // Proceed to final import step or API call
            console.log('Proceeding to import...');
          }}
        />
      )}
    </div>
  );
};

export default Department;