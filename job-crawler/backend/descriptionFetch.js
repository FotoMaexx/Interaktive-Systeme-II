import puppeteer from 'puppeteer';

// JSON-Daten
const jobData = [
  {
    "title": "Systemingenieur*in für Land Periskope & Beobachtungssysteme (w/m/d)",
    "jobId": "JR-14563",
    "link": "https://hensoldt.wd3.myworkdayjobs.com/de-DE/External_Career_Site/job/Oberkochen/Systemingenieur-in-fr-Land-Periskope---Beobachtungssysteme--w-m-d-_JR-14563-1"
  },
  {
    "title": "Manager Industrial Participation / Offset (w/m/d)",
    "jobId": "JR-14108",
    "link": "https://hensoldt.wd3.myworkdayjobs.com/de-DE/External_Career_Site/job/Ulm/Manager-Industrial-Participation---Offset--w-m-d-_JR-14108"
  },
  // Weitere Einträge...
];

// Funktion zum Abrufen und Erweitern der JSON-Daten mit der Job-Beschreibung
async function fetchAndExtendDescription(job) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Seite öffnen
    await page.goto(job.link, { waitUntil: 'networkidle2' });

    // 10 Sekunden warten, um sicherzustellen, dass die Seite vollständig geladen ist
    await new Promise(r => setTimeout(r, 10000)); // Verzögerung einfügen

    // HTML analysieren und den gewünschten Text extrahieren
    const jobDescription = await page.evaluate(() => {
      const descriptionElement = document.querySelector('div[data-automation-id="jobPostingDescription"]');
      if (!descriptionElement) return null;

      // Text extrahieren und formatieren
      let text = descriptionElement.innerText || "";
      
      // Abschnitte isolieren
      const sections = ['Über den Bereich', 'Ihre Aufgaben', 'Ihr Profil'];
      let relevantText = '';

      sections.forEach(section => {
        const regex = new RegExp(section + '.*?(?=(Über den Bereich|Ihre Aufgaben|Ihr Profil|$))', 's');
        const match = text.match(regex);
        if (match && match[0]) {
          relevantText += match[0].trim() + '\n\n';
        }
      });

      return relevantText.trim();
    });

    // Beschreibung zum JSON-Objekt hinzufügen
    if (jobDescription) {
      job.description = jobDescription;
      console.log('Erweiterte Job-Daten:', job);
    } else {
      console.warn('Jobbeschreibung nicht gefunden:', job.link);
    }

  } catch (error) {
    console.error('Fehler beim Abrufen der Seite:', error);
  } finally {
    await browser.close();
  }
}

// Erweitere den ersten Job in den JSON-Daten
fetchAndExtendDescription(jobData[0]);
