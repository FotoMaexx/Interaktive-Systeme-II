import fetch from 'node-fetch';
import { JSDOM } from 'jsdom'; // Hinzufügen von jsdom zum Parsen des HTML
import { fetchAndExtendDescription } from './sapDescriptionFetch.js';

export const fetchSapJobs = async (baseUrl) => {
    const headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
        "Accept-Language": "de-DE,de;q=0.9",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15"
    };

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

        const data = await response.text();
        return data;
    };

    let allJobData = [];
    let currentPage = 0;
    let hasMoreJobs = true;

    try {
        while (hasMoreJobs) {
            const mainUrl = `${baseUrl}/search/?searchby=location&createNewAlert=false&q=&locationsearch=&geolocation=&optionsFacetsDD_department=&optionsFacetsDD_customfield3=&optionsFacetsDD_country=&startrow=${currentPage * 50}`;
            console.log('Rufe Seite auf:', mainUrl);
            const pageData = await fetchData(mainUrl);

            // Parsen der HTML-Seite mit JSDOM
            const dom = new JSDOM(pageData);
            const document = dom.window.document;
            const jobElements = document.querySelectorAll('td.colTitle[headers="hdrTitle"]');

            if (jobElements.length === 0) {
                console.log('Keine weiteren Jobs gefunden, breche ab.');
                hasMoreJobs = false;
                break;
            }

            for (const jobElement of jobElements) {
                const titleElement = jobElement.querySelector('a.jobTitle-link');
                if (titleElement) {
                    const title = titleElement.textContent.trim();
                    const link = `${baseUrl}${titleElement.getAttribute('href')}`.replace('/search', '');
                    const job = { title, link };
                    
                    // Beschreibung und JobID abrufen
                    await fetchAndExtendDescription(job);
                    
                    allJobData.push(job);
                }
            }

            // Überprüfen, ob weniger als 50 Jobs gefunden wurden, um das Ende zu erkennen
            if (jobElements.length < 50) {
                console.log('Letzte Seite erreicht, keine weiteren Jobs.');
                hasMoreJobs = false;
            } else {
                currentPage++;
            }
        }

        console.log('Jobdaten erhalten:', allJobData);
        return allJobData;
    } catch (error) {
        console.error('Fehler beim Abrufen der Jobs:', error);
        throw error;
    }
};