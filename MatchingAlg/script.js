document.getElementById('job-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Antworten erfassen
    const answers = {
        question1: parseInt(document.querySelector('input[name="question1"]:checked').value),
        question2: parseInt(document.querySelector('input[name="question2"]:checked').value),
        question3: parseInt(document.querySelector('input[name="question3"]:checked').value)
    };

    // Job-Profile (Beispiel-Daten)
    const jobs = [
        { title: 'Softwareentwickler', requirements: { question1: 5, question2: 2, question3: 2 } },
        { title: 'Datenanalyst', requirements: { question1: 2, question2: 5, question3: 3 } },
        { title: 'Projektmanager', requirements: { question1: 3, question2: 3, question3: 5 } }
    ];

    // Matching-Algorithmus
    const jobScores = jobs.map(job => {
        let score = 0;
        for (const question in job.requirements) {
            score += Math.abs(job.requirements[question] - answers[question]); // Differenz zwischen Anforderungen und Antworten
        }
        return { job: job.title, score: score };
    });

    // Sortierung nach Score (je niedriger, desto besser)
    jobScores.sort((a, b) => a.score - b.score);

    // Ergebnisse anzeigen
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Passende Jobs:</h2>' + jobScores.map(jobScore => `<p>${jobScore.job}</p>`).join('');
});
