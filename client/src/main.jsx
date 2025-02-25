import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App'
import Department from './CSVImportPages/Department'
import Course from './CSVImportPages/Course'
import Colleges from './CSVImportPages/Colleges'
import Subjects from './CSVImportPages/Subjects'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/import-departments" element={<Department />} />
        <Route path="/import-courses" element={<Course />} />
        <Route path="/import-colleges" element={<Colleges />} />
        <Route path="/import-subjects" element={<Subjects />} />
        </Routes>
    </Router>
  </React.StrictMode>,
)