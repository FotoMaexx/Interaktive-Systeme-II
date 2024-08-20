document.addEventListener('DOMContentLoaded', () => {
    let currentQuestionIndex = 1;

    const questions = document.querySelectorAll('.question');
    
    // Funktion zum Anzeigen der aktuellen Frage
    const showQuestion = (index) => {
        questions.forEach((q, i) => q.style.display = (i + 1 === index) ? 'block' : 'none');
    };

    // Simple Match Algorithmus
    const calculateResults = () => {
        const answers = {
            question1: parseInt(document.querySelector('input[name="question1"]:checked')?.value) || 0,
            question2: parseInt(document.querySelector('input[name="question2"]:checked')?.value) || 0,
            question3: parseInt(document.querySelector('input[name="question3"]:checked')?.value) || 0,
            question4: parseInt(document.querySelector('input[name="question4"]:checked')?.value) || 0,
            question5: parseInt(document.querySelector('input[name="question5"]:checked')?.value) || 0,
            question6: parseInt(document.querySelector('input[name="question6"]:checked')?.value) || 0,
            question7: parseInt(document.querySelector('input[name="question7"]:checked')?.value) || 0,
            question8: parseInt(document.querySelector('input[name="question8"]:checked')?.value) || 0,
            question9: parseInt(document.querySelector('input[name="question9"]:checked')?.value) || 0,
            question10: parseInt(document.querySelector('input[name="question10"]:checked')?.value) || 0,
            question11: parseInt(document.querySelector('input[name="question11"]:checked')?.value) || 0
        };

        const jobs = [
            { title: 'Architekt', requirements: { question1: 5, question2: 5, question3: 5, question4: 0, question5: 0, question6: 0, question7: 0, question8: 0, question9: 0, question10: 0, question11: 0 } },
            { title: 'Lehrer', requirements: { question1: 0, question2: 0, question3: 0, question4: 5, question5: 5, question6: 5, question7: 0, question8: 0, question9: 0, question10: 0, question11: 0 } },
            { title: 'Arzt', requirements: { question1: 0, question2: 0, question3: 0, question4: 0, question5: 0, question6: 0, question7: 5, question8: 5, question9: 5, question10: 5, question11: 5 } }
        ];

        const maxScore = 55; // Maximale mögliche Punktzahl (5 * Anzahl der Fragen)

        const jobScores = jobs.map(job => {
            let score = 0;
            for (const question in job.requirements) {
                score += Math.abs(job.requirements[question] - answers[question]);
            }
            const percentage = 100 - (score / maxScore * 100); // Berechnung des Prozentsatzes
            return { job: job.title, percentage: percentage.toFixed(2) };
        });

        jobScores.sort((a, b) => b.percentage - a.percentage); // Sortieren nach Übereinstimmung in absteigender Reihenfolge

        return jobScores.map(jobScore => `<p>${jobScore.job}: ${jobScore.percentage}% Übereinstimmung</p>`).join('');
    };

    // Funktion zum Überprüfen, ob die aktuelle Frage beantwortet wurde
    const isQuestionAnswered = (index) => {
        return document.querySelector(`input[name="question${index}"]:checked`) !== null;
    };

    // Event-Listener für den Button "Weiter"
    document.querySelectorAll('.question button[id^="next"]').forEach(button => {
        button.addEventListener('click', () => {
            const nextQuestionIndex = parseInt(button.id.replace('next', ''));
            if (isQuestionAnswered(nextQuestionIndex)) {
                currentQuestionIndex = nextQuestionIndex + 1;
                showQuestion(currentQuestionIndex);
            } else {
                alert('Bitte beantworten Sie alle Fragen.');
            }
        });
    });

    // Event-Listener für den Button "Zurück"
    document.querySelectorAll('.question button[id^="prev"]').forEach(button => {
        button.addEventListener('click', () => {
            const prevQuestionIndex = parseInt(button.id.replace('prev', ''));
            currentQuestionIndex = prevQuestionIndex;
            showQuestion(currentQuestionIndex);
        });
    });

    // Event-Listener für den Button "Ergebnisse evaluieren"
    document.getElementById('submit').addEventListener('click', () => {
        if (isQuestionAnswered(11)) {
            document.getElementById('results-content').innerHTML = calculateResults();
            document.getElementById('results').style.display = 'block'; // Ergebnisse anzeigen
            currentQuestionIndex = 12; // Kein nächstes Fragefeld mehr
            showQuestion(currentQuestionIndex); // Verstecke alle Fragen
        } else {
            alert('Bitte beantworten Sie alle Fragen.');
        }
    });

    // Event-Listener für den Button "Nochmal starten"
    document.getElementById('restart').addEventListener('click', () => {
        currentQuestionIndex = 1;
        showQuestion(currentQuestionIndex);
        document.getElementById('job-form').reset();
        document.getElementById('results').style.display = 'none'; // Ergebnisse ausblenden
    });

    showQuestion(currentQuestionIndex); // Startseite anzeigen
});
