import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextInput, RadioButton, RadioButtonGroup, Grid, Row, Column, TextArea, ToastNotification } from 'carbon-components-react';
import { Save16 } from '@carbon/icons-react';
import { saveAs } from 'file-saver';
import './App.scss';

function App() {
  const [systemType, setSystemType] = useState('sap');
  const [url, setUrl] = useState('');
  const [jobs, setJobs] = useState([]);
  const [jsonOutput, setJsonOutput] = useState('');
  const [showNotification, setShowNotification] = useState(false);

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
      setJsonOutput(JSON.stringify(response.data, null, 2));
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('Fehler beim Abrufen der Jobs', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const date = new Date();
    const dateString = date.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeString = date.toTimeString().split(' ')[0]; // HH:MM:SS
    const fileName = `jobs_${dateString}_${timeString}.json`;
    saveAs(blob, fileName);
  };

  return (
    <div className="App">
      <h1>Job Crawler</h1>
      {showNotification && (
        <ToastNotification
          iconDescription="Schließen"
          subtitle={<span>Job-Daten erfolgreich abgerufen</span>}
          title="Erfolg"
          kind="success"
          timeout={3000}
        />
      )}
      <form onSubmit={handleSubmit}>
        <Grid>
          <Row className="form-row">
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
          <Row className="form-row">
            <Column>
              <RadioButtonGroup
                name="systemType"
                legendText="Wähle ein System"
                defaultSelected="sap"
                onChange={handleSystemChange}
              >
                {/* <RadioButton
                  id="sap"
                  labelText="SAP"
                  value="sap"
                /> */}
                <RadioButton
                  id="workday"
                  labelText="Workday"
                  value="workday"
                />
                {/* Füge weitere Optionen für andere Systeme hinzu */}
              </RadioButtonGroup>
            </Column>
          </Row>
          <Row className="form-row">
            <Column>
              <Button type="submit" renderIcon={Save16}>Crawl Jobs</Button>
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
      {jsonOutput && (
        <Grid>
          <Row>
            <Column>
              <TextArea
                id="json-output"
                labelText="JSON Output"
                value={jsonOutput}
                rows={10}
                readOnly
              />
              <Button kind="secondary" onClick={handleDownload} style={{ marginTop: '1rem' }}>
                Download JSON
              </Button>
            </Column>
          </Row>
        </Grid>
      )}
    </div>
  );
}

export default App;
