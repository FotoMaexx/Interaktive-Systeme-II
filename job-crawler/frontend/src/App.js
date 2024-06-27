import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [systemType, setSystemType] = useState('sap');
  const [jobs, setJobs] = useState([]);

  const handleSystemChange = (event) => {
    setSystemType(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/jobs', { systemType });
      setJobs(response.data);
    } catch (error) {
      console.error('Fehler beim Abrufen der Jobs', error);
    }
  };

  return (
    <div className="App">
      <h1>Job Listings</h1>
      <form onSubmit={handleSubmit}>
        <label>
          System:
          <select value={systemType} onChange={handleSystemChange}>
            <option value="sap">SAP</option>
            <option value="workday">Workday</option>
            {/* Füge weitere Optionen für andere Systeme hinzu */}
          </select>
        </label>
        <button type="submit">Crawl Jobs</button>
      </form>
      <ul>
        {jobs.map((job, index) => (
          <li key={index}>
            <h2>{job.title}</h2>
            <p>{job.company}</p>
            <p>{job.location}</p>
            <a href={job.link}>Link</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
