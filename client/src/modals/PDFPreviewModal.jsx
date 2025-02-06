import React from 'react';

const PDFPreviewModal = ({ pdfUrl, reportType, onClose }) => {
  if (!pdfUrl) return null;

  // ✅ Dynamically set the filename based on reportType
  const fileName = reportType ? `${reportType}-report.pdf` : 'report.pdf';

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">{reportType} Report Preview</h2>

        {/* PDF Preview */}
        <iframe src={pdfUrl} className="w-full h-[500px] border"></iframe>

        {/* Buttons */}
        <div className="mt-4 flex justify-end space-x-4">
          <a
            href={pdfUrl}
            download={fileName}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Download PDF
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;