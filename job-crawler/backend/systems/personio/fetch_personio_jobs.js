import fetch from 'node-fetch';
import { load } from 'cheerio';
import { fetchAndExtendDescription } from './personioDescriptionFetch.js';

export const fetchPersonioJobs = async (url) => {
    // Funktion zum Abrufen der HTML-Seite
    const fetchHtml = async (url) => {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Accept": "text/html",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15"
            }
        });

        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht in Ordnung');
        }

        const html = await response.text();
        return html;
    };

    // Funktion zum Entfernen von Sprachparametern aus der URL
    const removeLanguageParam = (link) => {
        const urlObj = new URL(link);
        urlObj.searchParams.delete('language'); // Sprachparameter entfernen
        return urlObj.href;
    };

    // Funktion zum Extrahieren der Jobs aus dem HTML
    const extractJobs = (html) => {
        const $ = load(html);
        const jobs = [];

        $('a.job-box-link').each((index, element) => {
            const title = $(element).find('.jb-title').text().trim();
            const jobId = $(element).attr('data-job-position-id');
            const relativeLink = $(element).attr('href').trim();
            let link = new URL(relativeLink, url).href; // Vollständige URL erstellen
            link = removeLanguageParam(link); // Sprachparameter entfernen

            const job = {
                title,
                jobId,
                link,
            };

            jobs.push(job);
        });

        return jobs;
    };

    // Hauptlogik zum Abrufen, Extrahieren der Jobdaten und Hinzufügen der Beschreibungen
    try {
        console.log('Rufe HTML-Seite ab:', url);
        const html = await fetchHtml(url);
        console.log('Seite geladen, beginne mit dem Extrahieren der Jobdaten.');

        const jobs = extractJobs(html);
        console.log('Jobs erfolgreich extrahiert:', jobs);

        // Erweiterung der Jobdetails um die Beschreibung
        for (const job of jobs) {
            console.log(`Erweitere Jobbeschreibung für: ${job.title}`);
            try {
                await fetchAndExtendDescription(job);
            } catch (error) {
                console.error(`Fehler beim Abrufen der Jobbeschreibung für ${job.title}:`, error);
            }
        }

        console.log('Alle Jobbeschreibungen wurden erweitert:', jobs);
        return jobs;
    } catch (error) {
        console.error('Fehler beim Abrufen der Jobs:', error);
        throw error;
    }
};
