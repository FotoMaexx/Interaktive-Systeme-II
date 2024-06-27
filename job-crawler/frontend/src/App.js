import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextInput, RadioButton, RadioButtonGroup, Grid, Row, Column } from 'carbon-components-react';
import './App.scss';

function App() {
  const [systemType, setSystemType] = useState('sap');
  const [url, setUrl] = useState('');
  const [jobs, setJobs] = useState([]);

  const handleSystemChange = (value) => {
    setSystemType(value);
  };

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/jobs', { systemType, url });
      setJobs(response.data);
    } catch (error) {
      console.error('Fehler beim Abrufen der Jobs', error);
    }
  };

  return (
    <div className="App">
      <h1>Job Listings</h1>
      <form onSubmit={handleSubmit}>
        <Grid>
          <Row>
            <Column>
              <TextInput
                id="url-input"
                labelText="Job URL"
                placeholder="https://example.com/jobs"
                value={url}
                onChange={handleUrlChange}
                required
              />
            </Column>
          </Row>
          <Row>
            <Column>
              <RadioButtonGroup
                name="systemType"
                legendText="Wähle ein System"
                defaultSelected="sap"
                onChange={handleSystemChange}
              >
                <RadioButton
                  id="sap"
                  labelText="SAP"
                  value="sap"
                />
                <RadioButton
                  id="workday"
                  labelText="Workday"
                  value="workday"
                />
                {/* Füge weitere Optionen für andere Systeme hinzu */}
              </RadioButtonGroup>
            </Column>
          </Row>
          <Row>
            <Column>
              <Button type="submit">Crawl Jobs</Button>
            </Column>
          </Row>
        </Grid>
      </form>
      <Grid>
        <Row>
          {jobs.map((job, index) => (
            <Column key={index} sm={4} md={4} lg={4}>
              <div className="job-listing">
                <h2>{job.title}</h2>
                <p>{job.company}</p>
                <p>{job.location}</p>
                <a href={job.link}>Link</a>
              </div>
            </Column>
          ))}
        </Row>
      </Grid>
    </div>
  );
}

export default App;
