import React, { useState } from 'react';
import CSVImporterPage from '../components/CSVImportPage';
import UploadModal from '../modals/UploadModal';
import CSVMappingPage from '../components/CSVMappingPage';
import CSVPreviewPage from '../components/CSVPreviewPage';
import PDFPreviewModal from '../modals/PDFPreviewModal';
import Papa from 'papaparse';

const Department = () => {
  const [showModal, setShowModal] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [step, setStep] = useState('landing'); // landing, mapping, preview
  const [pdfUrl, setPdfUrl] = useState(null); // PDF URL for preview modal

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
    fetch('http://localhost:4000/departments/column-names')
      .then((res) => res.json())
      .then((data) => setTableColumns(data.columns))
      .catch((err) => console.error('Error fetching table columns:', err));
  };

  // 📌 Fetch & Preview PDF Report
  const generateReport = async () => {
    try {
      const response = await fetch('http://localhost:4000/departments/pdf-report');
      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      setPdfUrl(pdfUrl);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return (
    <div>
      {step === 'landing' && (
        <>
          <CSVImporterPage
            entityName="Department"
            onUploadStart={() => setShowModal(true)}
            onGenerateReport={generateReport}
          />
          {showModal && (
            <UploadModal
              onClose={() => setShowModal(false)}
              onFileUpload={handleFileUpload}
            />
          )}
        </>
      )}

      {step === 'mapping' && (
        <CSVMappingPage
          csvData={csvData}
          headers={headers}
          tableColumns={tableColumns}
          onMappingChange={(mapping) => setColumnMapping(mapping)}
          onNext={() => setStep('preview')}
          onCancel={handleOnCancel}
          entityName="Departments"
        />
      )}

      {step === 'preview' && (
        <CSVPreviewPage
          csvData={csvData}
          columnMapping={columnMapping}
          onBack={() => setStep('mapping')}
          apiEndpoint="http://localhost:4000/departments/import"
          entityName="Departments"
        />
      )}

      {/* PDF Preview Modal */}
      {pdfUrl && <PDFPreviewModal pdfUrl={pdfUrl} onClose={() => setPdfUrl(null)} />}
    </div>
  );
};

export default Department;