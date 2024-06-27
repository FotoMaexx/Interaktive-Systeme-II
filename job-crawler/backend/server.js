const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 5001; // Port geändert

app.use(cors());
app.use(bodyParser.json());

const systems = {
  sap: {
    selectors: {
      jobListing: '.sap-job-listing',
      jobTitle: '.sap-job-title',
      companyName: '.sap-company-name',
      jobLocation: '.sap-job-location',
      jobLink: 'a.sap-job-link'
    }
  },
  workday: {
    selectors: {
      jobListing: '.workday-job-listing',
      jobTitle: '.workday-job-title',
      companyName: '.workday-company-name',
      jobLocation: '.workday-job-location',
      jobLink: 'a.workday-job-link'
    }
  }
};

const fetchHTML = async (url) => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error(`Fehler beim Abrufen der URL: ${url}`, error);
  }
};

const parseJobs = (html, selectors) => {
  const $ = cheerio.load(html);
  const jobs = [];

  $(selectors.jobListing).each((index, element) => {
    const title = $(element).find(selectors.jobTitle).text().trim();
    const company = $(element).find(selectors.companyName).text().trim();
    const location = $(element).find(selectors.jobLocation).text().trim();
    const link = $(element).find(selectors.jobLink).attr('href');

    jobs.push({ title, company, location, link });
  });

  return jobs;
};

const saveJobsToFile = (jobs) => {
  const jsonContent = JSON.stringify(jobs, null, 2);
  fs.writeFile('jobs.json', jsonContent, 'utf8', (err) => {
    if (err) {
      console.error('Fehler beim Speichern der Jobs in Datei', err);
    } else {
      console.log('Jobs erfolgreich gespeichert');
    }
  });
};

app.post('/api/jobs', async (req, res) => {
  const { systemType, url } = req.body;
  const system = systems[systemType];

  if (!system) {
    return res.status(400).send('Ungültiges System');
  }

  const html = await fetchHTML(url);
  if (html) {
    const jobs = parseJobs(html, system.selectors);
    saveJobsToFile(jobs);  // Speichern der Jobs in eine Datei
    res.json(jobs);
  } else {
    res.status(500).send('Fehler beim Abrufen der Jobs');
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
