import puppeteer from 'puppeteer';

export async function fetchAndExtendDescription(job) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        console.log(`Rufe Seite auf: ${job.link}`);
        
        await page.goto(job.link, { waitUntil: 'networkidle2' });

        await new Promise(r => setTimeout(r, 3000));

        // Extrahiere die Jobbeschreibung bis zu "Also: Wanna WOW with us?"
        const jobDescription = await page.evaluate(() => {
            const descriptionElement = document.querySelector('div.tpl_k_container.tpl_k_desc');
            if (!descriptionElement) return null;

            let text = descriptionElement.innerText || "";
            const endText = "Also: Wanna WOW with us?";
            const endIndex = text.indexOf(endText);
            if (endIndex !== -1) {
                text = text.substring(0, endIndex).trim();
            }

            return text;
        });

        if (jobDescription) {
            job.description = jobDescription;
            console.log('Jobbeschreibung hinzugefügt:', job);
        } else {
            console.warn('Keine Jobbeschreibung gefunden für:', job.link);
        }

        // Extrahiere die Job-ID aus dem entsprechenden Span-Element
        const jobId = await page.evaluate(() => {
            const jobIdElement = document.querySelector('div.tpl_k_icon-with-facts > span');
            return jobIdElement ? jobIdElement.textContent.trim() : null;
        });

        if (jobId) {
            job.jobId = jobId;
            console.log('Job-ID hinzugefügt:', jobId);
        } else {
            console.warn('Keine Job-ID gefunden für:', job.link);
        }

    } catch (error) {
        console.error('Fehler beim Abrufen der Seite:', error);
    } finally {
        await browser.close();
    }
}