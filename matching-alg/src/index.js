// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Importiere Router
import './index.css';
import App from './App';
import JobFinder from './JobFinder'; // Importiere die JobFinder-Komponente
import JobDetail from './JobDetail'; // Importiere die JobDetail-Komponente
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/job-finder" element={<JobFinder />} /> {/* Route für den JobFinder */}
        <Route path="/job/:jobTitle" element={<JobDetail />} /> {/* Route für JobDetails */}
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();

