import React from 'react';
import { Route, Routes } from 'react-router-dom';
import JobFinder from './JobFinder';
import JobDetail from './JobDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<JobFinder />} />
      <Route path="/job/:jobTitle" element={<JobDetail />} /> {/* Dynamischer Parameter */}
    </Routes>
  );
}

export default App;


