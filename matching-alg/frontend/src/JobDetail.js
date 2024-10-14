import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const JobDetail = () => {
  const { jobTitle } = useParams();
  const [job, setJob] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Dynamischer Abruf der Jobdaten basierend auf dem Job-Titel
    fetch('/api/jobs') // Abruf der gesamten Jobliste
      .then(response => response.json())
      .then(data => {
        const decodedTitle = decodeURIComponent(jobTitle);
        const foundJob = data.jobs.find(job => job.title === decodedTitle);
        setJob(foundJob);
      })
      .catch(error => console.error('Error fetching job data:', error));
  }, [jobTitle]);

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
