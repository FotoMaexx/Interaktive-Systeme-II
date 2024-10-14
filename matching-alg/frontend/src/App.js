import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import JobFinder from './JobFinder';
import JobDetail from './JobDetail';

function App() {
  const [ciData, setCiData] = useState({
    primaryColor: '#3498db',
    secondaryColor: '#2ecc71',
    fontFamily: 'Arial, sans-serif',
    logoPath: '/uploads/default-logo.png',  // Standardlogo
  });

  useEffect(() => {
    // CI-Daten vom Backend abrufen
    fetch('http://localhost:5001/api/ci')
      .then((response) => response.json())
      .then((data) => {
        console.log('CI-Daten:', data);  // CI-Daten loggen, um zu prüfen, was zurückkommt
        setCiData(data);  // CI-Daten speichern
        document.documentElement.style.setProperty('--primary-color', data.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', data.secondaryColor);
      })
      .catch((error) => console.error('Fehler beim Abrufen der CI-Daten:', error));
  }, []);

  return (
    <div>
      <header
        style={{
          backgroundColor: 'var(--primary-color)',  // Verwende die dynamische Primärfarbe
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <img src={`http://localhost:5001${ciData.logoPath}`} alt="Firmenlogo" style={{ width: '150px' }} />
      </header>

      <Routes>
        <Route path="/" element={<JobFinder />} />
        <Route path="/job/:jobTitle" element={<JobDetail />} />  {/* Dynamischer Parameter */}
      </Routes>
    </div>
  );
}

export default App;
