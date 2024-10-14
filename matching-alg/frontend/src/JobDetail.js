import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jobData from './jobs.json'; // Pfad zur JSON-Datei anpassen

const JobDetail = () => {
  const { jobTitle } = useParams(); // Nimmt den Jobtitel aus der URL
  const navigate = useNavigate(); // Verwende den navigate-Hook, um zurück zu navigieren

  // Stelle sicher, dass der Jobtitel dekodiert wird
  const decodedTitle = decodeURIComponent(jobTitle);
  const job = jobData.jobs.find(job => job.title === decodedTitle); // Suche den Job mit dem dekodierten Titel

  if (!job) {
    return <p>Job nicht gefunden.</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>{job.title}</h2>
      <p>{job.description}</p>
      <ul>
        {Object.entries(job.Bewertung).map(([key, value], index) => (
          <li key={index}>
            <strong>{key}:</strong> {value}
          </li>
        ))}
      </ul>
      <button
        onClick={() => navigate(-1)} // Zurück zur vorherigen Seite
        style={{
          display: 'block',
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Zurück zu den Ergebnissen
      </button>
    </div>
  );
};

export default JobDetail;



