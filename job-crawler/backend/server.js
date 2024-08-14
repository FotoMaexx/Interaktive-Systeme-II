import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { fetchWorkdayJobs } from './fetch_workday_jobs.js';
// import { fetchSapJobs } from './fetch_sap_jobs.js';
// import { fetchOracleJobs } from './fetch_oracle_jobs.js';
// import { fetchIcimsJobs } from './fetch_icims_jobs.js';

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/jobs', async (req, res) => {
  const { systemType, url } = req.body;

  // Validierung der Anfrage-Daten
  if (!systemType || !url) {
    return res.status(400).send('Fehlende systemType oder URL');
  }

  try {
    let jobs;
    switch (systemType) {
      case 'workday':
        console.log(`Starting crawl for Workday URL: ${url}`);
        jobs = await fetchWorkdayJobs(url);
        break;
      case 'sap':
        console.log(`Starting crawl for SAP URL: ${url}`);
        jobs = await fetchSapJobs(url);
        break;
      case 'oracle':
        console.log(`Starting crawl for Oracle URL: ${url}`);
        jobs = await fetchOracleJobs(url);
        break;
      case 'icims':
        console.log(`Starting crawl for iCIMS URL: ${url}`);
        jobs = await fetchIcimsJobs(url);
        break;
      default:
        return res.status(400).send('Unsupported system type');
    }
    console.log(`Crawled data: ${JSON.stringify(jobs, null, 2)}`);
    res.json(jobs);
  } catch (error) {
    res.status(500).send('Fehler beim Abrufen der Job-Listings');
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
