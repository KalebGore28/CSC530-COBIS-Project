// App.jsx

import React from 'react';

function App() {
	return (
		<div>
			<h1 className="bg-amber-800">App</h1>
			<p>Welcome to the Home page!</p>
			<p>Click on the links below to navigate to other pages:</p>
			<ul>
				<li style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column' }}>
					<a href="/import-departments">Department Importer</a>
					<a href="/import-courses">Course Importer</a>
					<a href="/import-colleges">Colleges Importer</a>
					<a href="/import-subjects">Subjects Importer</a>
				</li>
			</ul>
		</div>
	);
}

export default App;