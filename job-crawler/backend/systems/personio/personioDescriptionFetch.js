import puppeteer from 'puppeteer';

console.log('personioDescriptionFetch.js wurde geladen');

export async function fetchAndExtendDescription(job) {
    const browser = await puppeteer.launch({ headless: true });
    console.log(`Starte Browser für Job: ${job.title}`);
    const page = await browser.newPage();

    try {
        console.log(`Rufe Seite auf: ${job.link}`);
        
        await page.goto(job.link, { waitUntil: 'networkidle2' });

        // Warten, um sicherzustellen, dass alle Inhalte geladen sind
        await new Promise(r => setTimeout(r, 3000));

        // Extrahieren der Jobbeschreibung ohne den "Über uns" und "Kontakt"-Teil
        const jobDescription = await page.evaluate(() => {
            const descriptionElement = document.querySelector('.description-wrapper');
            if (!descriptionElement) return null;

            let text = descriptionElement.innerText || "";

            // Entfernen des "Über uns"-Teils
            const overUsIndex = text.indexOf('Über uns');
            if (overUsIndex !== -1) {
                text = text.substring(0, overUsIndex).trim();
            }

            // Entfernen des "Kontakt"-Teils
            const contactIndex = text.indexOf('Kontakt');
            if (contactIndex !== -1) {
                text = text.substring(0, contactIndex).trim();
            }

            // Abschnitte, die extrahiert werden sollen
            const sections = ['Ihre Aufgaben', 'Ihr Profil', 'Ihre Vorteile'];
            let relevantText = '';

            sections.forEach(section => {
                const regex = new RegExp(section + '.*?(?=(Ihre Aufgaben|Ihr Profil|Ihre Vorteile|$))', 's');
                const match = text.match(regex);
                if (match && match[0]) {
                    relevantText += match[0].trim() + '\n\n';
                }
            });

            return relevantText.trim();
        });

        if (jobDescription) {
            job.description = jobDescription;
            console.log('Jobbeschreibung hinzugefügt:', job);
        } else {
            console.warn('Keine Jobbeschreibung gefunden für:', job.link);
        }

    } catch (error) {
        console.error('Fehler beim Abrufen der Seite:', error);
    } finally {
        await browser.close();
    }
}
