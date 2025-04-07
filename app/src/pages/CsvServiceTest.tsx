import React from 'react';
import CsvServiceTester from '../components/CsvServiceTester';

/**
 * Page for testing the CSV Import Service
 * This page can be integrated into your existing application routes
 * where authentication is already handled
 */
export const CsvServiceTestPage: React.FC = () => {
	return (
		<div className="container py-8">
			<h1 className="text-2xl font-bold mb-6">CSV Import Service Test Page</h1>
			<p className="text-slate-600 mb-8">
				This page allows you to test the CSV Import Service functionality while respecting your existing authentication and CORS setup.
			</p>

			<CsvServiceTester />
		</div>
	);
};

export default CsvServiceTestPage; 