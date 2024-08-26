import puppeteer from 'puppeteer';

console.log('workdayDescriptionFetch.js wurde geladen'); // Füge dies hinzu

export async function fetchAndExtendDescription(job) {
    const browser = await puppeteer.launch();
    console.log(`Starte Browser für Job: ${job.title}`); // Füge dies hinzu
    const page = await browser.newPage();

    try {
        console.log(`Rufe Seite auf: ${job.link}`);
        
        await page.goto(job.link, { waitUntil: 'networkidle2' });

        await new Promise(r => setTimeout(r, 3000));

        const jobDescription = await page.evaluate(() => {
            const descriptionElement = document.querySelector('div[data-automation-id="jobPostingDescription"]');
            if (!descriptionElement) return null;

            let text = descriptionElement.innerText || "";

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
