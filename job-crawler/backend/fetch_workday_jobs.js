import fetch from 'node-fetch';
import fs from 'fs';

// Die Header für die Anfrage
const headers = {
    "Accept": "application/json,application/xml",
    "Accept-Language": "de-DE,de;q=0.9",
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "X-Workday-Client": "2024.27.5"
};

// Funktion zum Abrufen der Daten
const fetchData = async (url) => {
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
        throw new Error('Netzwerkantwort war nicht in Ordnung');
    }

    const data = await response.json();
    return data;
};

// Funktion zum Abrufen der Jobs
export const fetchWorkdayJobs = async (baseUrl) => {
    const external = "/External_Career_Site";
    const paginationPath = "/searchPagination/318c8bb6f553100021d223d9780d30be";
    let allJobData = [];

    // Grundseite laden
    const mainUrl = `${baseUrl}${external}/5/refreshFacet/318c8bb6f553100021d223d9780d30be?clientRequestID=a0a1fd44e5de4d4da35b50143b3e5b67`;

    // Schleife zum Abrufen aller Daten von allen möglichen Ordnern
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

        // Daten in eine Datei schreiben (optional)
        fs.writeFileSync('all_job_data.json', JSON.stringify(allJobData, null, 2));
        console.log('Alle Daten erfolgreich gespeichert!');

        // Jobinformationen extrahieren und zurückgeben
        const jobDetails = allJobData.map(job => {
            const title = job.title.instances[0].text;
            const jobId = job.subtitles[0].instances[0].text;
            const link = `${baseUrl}${job.title.commandLink}`;

            return { title, jobId, link };
        });

        return jobDetails;
    } catch (error) {
        console.error('Fehler beim Abrufen der Jobs:', error);
        throw error;
    }
};
