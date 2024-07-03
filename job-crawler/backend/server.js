const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

const systems = {
  workday: {
    selectors: {
      jobListing: '[data-automation-id="compositeContainer"]', // Selektor für Job-Listings
      jobId: '[data-automation-id="compositeSubHeaderOne"]',
      jobName: '[data-automation-id="promptOption"]',
      jobLink: '[data-automation-id="promptOption"] a'
    }
  }
};

const crawlWorkday = async (url, selectors) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  console.log(`Navigating to URL: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Warten, bis die Job-Listings geladen sind
  try {
    await page.waitForSelector(selectors.jobListing, { timeout: 90000 });
    console.log(`Page loaded`);
  } catch (error) {
    console.error(`Error waiting for selector: ${selectors.jobListing}`);
    const content = await page.content();
    fs.writeFileSync('page_content.html', content);  // Speichern des HTML-Inhalts der Seite
    await page.screenshot({ path: 'error_screenshot.png' });
    await browser.close();
    throw error;
  }

  // Scrollen, um alle Elemente zu laden
  await autoScroll(page);
  console.log(`Scrolled through the page`);

  // Sammle Links zu den Jobanzeigen, Job-IDs und Job-Namen
  const jobListings = await page.evaluate((selectors) => {
    const listings = [];
    const elements = document.querySelectorAll(selectors.jobListing);
    console.log(`Found ${elements.length} job listing elements`);

    elements.forEach(element => {
      const jobIdElement = element.querySelector(selectors.jobId);
      const jobNameElement = element.querySelector(selectors.jobName);
      const jobLinkElement = element.querySelector(selectors.jobLink);
      console.log(`Job ID Element: ${jobIdElement ? jobIdElement.innerText : 'not found'}`);
      console.log(`Job Name Element: ${jobNameElement ? jobNameElement.innerText : 'not found'}`);
      console.log(`Job Link Element: ${jobLinkElement ? jobLinkElement.href : 'not found'}`);

      if (jobIdElement && jobNameElement && jobLinkElement) {
        const jobId = jobIdElement.innerText.split('|')[0].trim();
        const jobName = jobNameElement.innerText;
        const jobLink = jobLinkElement.href;
        listings.push({ jobId, jobName, jobLink });
      }
    });
    return listings;
  }, selectors);

  console.log(`Found job listings: ${JSON.stringify(jobListings, null, 2)}`);

  await browser.close();
  return jobListings;
};

// Funktion zum automatischen Scrollen der Seite
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

app.post('/api/jobs', async (req, res) => {
  const { systemType, url } = req.body;
  const system = systems[systemType];

  if (!system) {
    return res.status(400).send('Ungültiges System');
  }

  if (systemType === 'workday') {
    console.log(`Starting crawl for Workday URL: ${url}`);
    try {
      const jobListings = await crawlWorkday(url, system.selectors);
      console.log(`Crawled data: ${JSON.stringify(jobListings, null, 2)}`);
      res.json(jobListings);
    } catch (error) {
      res.status(500).send('Fehler beim Abrufen der Job-Listings');
    }
  } else {
    res.status(400).send('Unsupported system type');
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
