import puppeteer from 'puppeteer';
import fs from 'fs';

// Funktion zum Einlesen des JSON-Files
function readJsonFile(filePath) {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
}

// Funktion zum Speichern des JSON-Files
function writeJsonFile(filePath, data) {
  const jsonData = JSON.stringify(data, null, 2); // Pretty print with 2-space indentation
  fs.writeFileSync(filePath, jsonData, 'utf8');
}

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

// Hauptfunktion zum Einlesen, Bearbeiten und Speichern des JSON-Files
async function processJsonFile(inputFilePath, outputFilePath) {
  const jobData = readJsonFile(inputFilePath);

  // Durchlaufe alle Jobs im JSON und erweitere sie mit der Beschreibung
  for (let job of jobData) {
    await fetchAndExtendDescription(job);
  }

  // Speichere das erweiterte JSON in einer Datei
  writeJsonFile(outputFilePath, jobData);
}

// Pfade zu den JSON-Dateien
const inputFilePath = '/Users/maximilianhauser/Desktop/Uni/8.Semester/IntSys2/UE/job-crawler/backend/TestJSON.json';
const outputFilePath = '/Users/maximilianhauser/Desktop/Uni/8.Semester/IntSys2/UE/job-crawler/backend/TestJSON_Descr.json';

// Starte die Verarbeitung des JSON-Files
processJsonFile(inputFilePath, outputFilePath);
