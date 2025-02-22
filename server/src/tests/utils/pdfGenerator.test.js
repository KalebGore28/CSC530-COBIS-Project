import { describe, test, expect } from 'vitest';
import generatePDF from '../../utils/pdfGenerator.js';

describe('PDF Generator', () => {
  test('should generate a PDF buffer', async () => {
    const title = 'Test Report';
    const headers = [{ text: 'Column 1', bold: true }, { text: 'Column 2', bold: true }];
    const data = [['Row 1 Col 1', 'Row 1 Col 2'], ['Row 2 Col 1', 'Row 2 Col 2']];
    const options = { pageSize: 'A4' };

    // Generate the PDF
    const pdfBuffer = await generatePDF(title, headers, data, options);

    // Expect the buffer to be defined and have some content
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  test('should handle empty data gracefully', async () => {
    const title = 'Empty Report';
    const headers = [{ text: 'Column 1', bold: true }];
    const data = []; // Empty table data
    const options = { pageSize: 'A4' };

    // Generate the PDF
    const pdfBuffer = await generatePDF(title, headers, data, options);

    // Expect the buffer to be valid but potentially small
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });
});