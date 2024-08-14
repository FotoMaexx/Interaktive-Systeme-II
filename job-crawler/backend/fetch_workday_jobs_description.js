import fetch from 'node-fetch';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import path from 'path';

// Die Header für die Anfrage
const headers = {
    "Accept": "application/json,application/xml",
    "Accept-Language": "de-DE,de;q=0.9",
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "X-Workday-Client": "2024.27.5"
};

// Funktion zum Abrufen der Daten
const fetchData = async (url, retries = 3) => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            credentials: 'include',
            mode: 'cors',
            redirect: 'follow',
            referrer: url,
            referrerPolicy: 'no-referrer-when-downgrade'
        });

        if (!response.ok) {
            console.error(`HTTP-Error: ${response.status} ${response.statusText}`);
            console.error(`Response URL: ${response.url}`);
            const text = await response.text();
            console.error(`Response Text: ${text}`);
            throw new Error('Netzwerkantwort war nicht in Ordnung');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (retries > 0) {
            console.warn(`Retrying (${3 - retries}/3) for URL: ${url}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
            return fetchData(url, retries - 1);
        } else {
            console.error(`Fehler beim Abrufen der Daten von URL: ${url}`, error);
            throw error;
        }
    }
};

// Funktion zum Abrufen des Job-Beschreibungstextes
const fetchJobDescription = async (url) => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            credentials: 'include',
            mode: 'cors',
            redirect: 'follow',
            referrer: url,
            referrerPolicy: 'no-referrer-when-downgrade'
        });

        if (!response.ok) {
            console.error(`HTTP-Error: ${response.status} ${response.statusText}`);
            console.error(`Response URL: ${response.url}`);
            const text = await response.text();
            console.error(`Response Text: ${text}`);
            throw new Error('Netzwerkantwort war nicht in Ordnung');
        }

        const html = await response.text();
        const dom = new JSDOM(html);
        const descriptionElement = dom.window.document.querySelector('div[data-automation-id="jobPostingDescription"]');
        return descriptionElement ? descriptionElement.textContent.trim() : '';
    } catch (error) {
        console.error(`Fehler beim Abrufen der Jobbeschreibung von URL: ${url}`, error);
        return '';
    }
};

// Funktion zum Abrufen der Jobs und Speichern in einer JSON-Datei
const fetchAndSaveWorkdayJobs = async (baseUrl) => {
    const external = "/External_Career_Site";
    const paginationPath = "/searchPagination/318c8bb6f553100021d223d9780d30be";
    let allJobData = [];

    // Grundseite laden
    const mainUrl = `${baseUrl}${external}/5/refreshFacet/318c8bb6f553100021d223d9780d30be?clientRequestID=a0a1fd44e5de4d4da35b50143b3e5b67`;

    try {
        // Hauptseite zuerst laden
        const mainData = await fetchData(mainUrl);
        let jobList = mainData.body.children[0].children[0].listItems;
        allJobData = allJobData.concat(jobList);

        // Überprüfen aller möglichen Seiten von 1 bis 99
        for (let i = 1; i < 100; i++) {
            const offset = i * 50;
            const url = `${baseUrl}${external}/${i}${paginationPath}/${offset}?clientRequestID=${Math.random().toString(36).substring(2, 15)}`;
            try {
                const data = await fetchData(url);
                jobList = data.body.children[0].children[0].listItems;
                if (jobList.length === 0) {
                    break; // Beenden, wenn keine Daten mehr vorhanden sind
                }
                allJobData = allJobData.concat(jobList);
            } catch (error) {
                console.error(`Fehler beim Abrufen der Jobs von Seite ${i}:`, error);
                break;
            }
        }

        // Daten in eine Datei schreiben
        const filePath = path.join(__dirname, 'all_job_data.json');
        fs.writeFileSync(filePath, JSON.stringify(allJobData, null, 2));
        console.log('Alle Daten erfolgreich gespeichert:', filePath);

        return allJobData;
    } catch (error) {
        console.error('Fehler beim Abrufen der Jobs:', error);
        throw error;
    }
};

// Funktion zum Abrufen der Jobbeschreibungen und Aktualisieren der JSON-Datei
const updateJobDescriptions = async () => {
    const filePath = path.join(__dirname, 'all_job_data.json');
    const jobData = JSON.parse(fs.readFileSync(filePath));

    for (const job of jobData) {
        const link = `https://hensoldt.wd3.myworkdayjobs.com${job.title.commandLink}`;
        const description = await fetchJobDescription(link);
        job.description = description;
        console.log(`Beschreibung für Job ${job.subtitles[0].instances[0].text} abgerufen.`);
    }

    fs.writeFileSync(filePath, JSON.stringify(jobData, null, 2));
    console.log('Alle Jobbeschreibungen erfolgreich aktualisiert.');
};

// Beispielaufruf der Funktion
const baseUrl = 'https://hensoldt.wd3.myworkdayjobs.com'; // Basis-URL

// Zuerst alle Jobs abrufen und speichern
fetchAndSaveWorkdayJobs(baseUrl).then(() => {
    // Danach die Jobbeschreibungen aktualisieren
    updateJobDescriptions().catch(error => {
        console.error('Fehler beim Aktualisieren der Jobbeschreibungen:', error);
    });
}).catch(error => {
    console.error('Fehler:', error);
});
