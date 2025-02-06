import PdfPrinter from 'pdfmake';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Correctly get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load fonts for pdfmake
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../fonts/Roboto-Bold.ttf'),
  },
};

const printer = new PdfPrinter(fonts);

/**
 * Generates a PDF report with customizable column widths.
 *
 * @param {string} title - The title of the report
 * @param {Array} headers - Array of column headers (e.g., [{ text: 'Course', bold: true }, ...])
 * @param {Array} data - Array of row data (each row is an array of column values)
 * @param {Object} options - Customization options (optional)
 * @returns {Buffer} - PDF Buffer
 */
const generatePDF = (title, headers, data, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Build the table body
      const tableBody = [headers, ...data];

      // Determine column widths dynamically based on content
      let columnWidths = options.columnWidths;
      if (!columnWidths) {
        columnWidths = headers.map((_, index) => {
          const maxContentLength = Math.max(
            ...data.map(row => (row[index] ? row[index].toString().length : 0)), 
            headers[index].text.length
          );

          return maxContentLength > 30 ? '*' : 'auto';
        });
      }

      // Define the PDF document structure
      const docDefinition = {
        pageSize: options.pageSize || 'A4',
        pageMargins: options.pageMargins || [40, 60, 40, 60],
        content: [
          { text: title, style: 'header' },
          {
            table: {
              widths: columnWidths,
              body: tableBody,
            },
            margin: [0, 20, 0, 0],
          },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 10],
          },
        },
      };

      // Generate the PDF document
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks = [];

      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));

      pdfDoc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default generatePDF;