import React, { useState, useEffect } from 'react';
import { Button, Theme, Heading, Form } from '@carbon/react';
import '@carbon/styles/css/styles.css';

const JobFinder = () => {
  const totalQuestions = 10;
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [started, setStarted] = useState(false);
  const [jobBewertung, setJobBewertung] = useState([]);  
  const [maxScore, setMaxScore] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [view, setView] = useState('questions'); 

  // Jobdaten aus dem Backend laden
  useEffect(() => {
    fetch('http://localhost:5001/api/ci/jobs')  // API-Endpunkt
      .then(response => response.json())
      .then(data => {
        if (data.jobs) {
          setJobBewertung(data.jobs);  // Jobdaten im State speichern

          // Berechnung des maximalen Scores für die Jobs
          const max = data.jobs.reduce((acc, job) => {
            const jobMax = Object.values(job.Bewertung).reduce((sum, value) => sum + value, 0);
            return Math.max(acc, jobMax);
          }, 0);
          setMaxScore(max);
        } else {
          console.error('Keine Jobs in den Daten gefunden.');
        }
      })
      .catch(error => console.error('Fehler beim Laden der Jobdaten:', error));
  }, []);  

  // Testbeginn
  const handleStart = () => {
    setStarted(true);
  };

  // Handhabung der Antwortänderung für jede Frage
  const handleChange = (question, value) => {
    setAnswers({
      ...answers,
      [question]: value,
    });
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      setIsAnswered(!!answers[`question${currentQuestion + 1}`]);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
      setIsAnswered(!!answers[`question${currentQuestion - 1}`]);
    }
  };

  // Handhabung des Ergebnisses
  const handleSubmit = () => {
    if (Object.keys(answers).length < totalQuestions) {
      alert('Bitte beantworten Sie alle Fragen.');
      return;
    }

    const calculatedResults = calculateResults();
    setResults(calculatedResults);
    setShowResults(true);
    setCurrentQuestion(totalQuestions + 1);
    setView('results'); 
  };

  const handleRestart = () => {
    setAnswers({});
    setResults([]);
    setShowResults(false);
    setCurrentQuestion(1);
    setIsAnswered(false);
    setStarted(false);
    setSelectedJob(null);
    setView('questions'); 
  };

  // Berechnung der Übereinstimmung der Antworten mit den Jobbewertungen
  const calculateResults = () => {
    if (!jobBewertung.length) return [];

    const maxDifference = 10; // Unterschiedliche Bewertungsskala (1-10)

    const jobScores = jobBewertung.map(job => {
      const Bewertung = job.Bewertung;
      let weightedMatchCount = 0;
      let totalWeight = 0;

      const questions = {
        question1: "Erforderliche Berufserfahrung",
        question2: "Erforderliche Ausbildung und Qualifikationen",
        question3: "Technische Fähigkeiten",
        question4: "Soft Skills",
        question5: "Branchenerfahrung",
        question6: "Sprachkenntnisse",
        question7: "Arbeitszeit und Flexibilität",
        question8: "Reisebereitschaft und Standort",
        question9: "Karriereentwicklung und Weiterbildungsangebote",
        question10: "Vergütung und Zusatzleistungen"
      };

      // Definiere Gewichtungen (optional, abhängig vom Nutzer)
      const weights = {
        "Erforderliche Berufserfahrung": 1.5,
        "Technische Fähigkeiten": 1.2,
        "Vergütung und Zusatzleistungen": 1.0,
        // ... weitere Gewichtungen
      };

      // Berechne den Match-Score
      Object.keys(questions).forEach((key) => {
        const questionKey = questions[key];
        const jobValue = Bewertung[questionKey];
        const userValue = answers[key] || 0;

        const difference = Math.abs(jobValue - (userValue * 2)); // Nutzerantwort auf Job-Skala bringen
        const score = ((maxDifference - difference) / maxDifference) * 100;

        const weight = weights[questionKey] || 1.0; // Standardgewichtung ist 1
        weightedMatchCount += score * weight;
        totalWeight += weight;
      });

      const weightedPercentage = (weightedMatchCount / totalWeight).toFixed(2);
      return { job: job.title, percentage: weightedPercentage, url: job.link, description: job.description };
    });

    jobScores.sort((a, b) => b.percentage - a.percentage);
    return jobScores.slice(0, 4); // Zeige die Top 4 Ergebnisse
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setView('details'); 
  };

  const handleCloseDetails = () => {
    setSelectedJob(null);
    setView('results'); 
  };

  const renderQuestion = (questionNumber, questionText) => (
    <div style={{ display: currentQuestion === questionNumber ? 'block' : 'none', marginBottom: '40px' }}>
      <Heading as="h3" style={{ marginBottom: '20px', fontSize: '2rem', fontWeight: '600', color: '#333' }}>
        {questionText}
      </Heading>
      <p style={{ marginBottom: '20px', color: '#666', fontSize: '1.25rem' }}>Frage {questionNumber} von {totalQuestions}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        {['Schlecht', 'Nicht gut', 'Mittelmäßig', 'Gut', 'Sehr gut'].map((label, index) => (
          <label key={index} style={{ flex: 1, textAlign: 'center' }}>
            <input
              type="radio"
              name={`question${questionNumber}`}
              value={index + 1}
              checked={answers[`question${questionNumber}`] === index + 1}
              onChange={() => handleChange(`question${questionNumber}`, index + 1)}
              style={{ marginRight: '8px' }}
            />
            {label}
          </label>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
        {questionNumber > 1 && (
          <Button kind="secondary" size="lg" onClick={handlePrev} style={{ flex: '1', marginRight: '20px' }}>Zurück</Button>
        )}
        {questionNumber < totalQuestions ? (
          <Button kind="primary" size="lg" onClick={handleNext} style={{ flex: '1' }} disabled={!isAnswered}>Weiter</Button>
        ) : (
          <Button kind="primary" size="lg" onClick={handleSubmit} style={{ flex: '1' }} disabled={!isAnswered}>Ergebnisse evaluieren</Button>
        )}
      </div>
    </div>
  );

  const renderJobDetails = () => (
    <div style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
      <Heading as="h4" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
        {selectedJob.job}
      </Heading>
      <p>Dieser Job passt zu {selectedJob.percentage}% zu dir</p>
      <p>{selectedJob.additionalInfo}</p>
      <p>
        <Button kind="secondary" size="sm" onClick={handleCloseDetails}>Schließen</Button>
        <Button kind="primary" size="sm" onClick={() => window.open(selectedJob.link, '_blank')}>Jetzt bewerben</Button>
      </p>
    </div>
  );

  return (
    <Theme theme="white">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header
          onClick={handleRestart}
          style={{
            backgroundColor: 'var(--primary-color)',
            color: '#fff',
            padding: '10px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <Heading as="h1" style={{ fontSize: '2rem', margin: 0 }}>Jobfinder</Heading>
        </header>
        <main style={{ flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ maxWidth: '800px', width: '100%' }}>
            {!started ? (
              <div style={{ textAlign: 'center' }}>
                <Heading as="h2" style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Finde den besten Job für dich!</Heading>
                <Button kind="primary" size="lg" onClick={handleStart}>Starten</Button>
              </div>
            ) : (
              <Form>
                {view === 'questions' && (
                  <>
                    {renderQuestion(1, 'Wie gut passt deine Berufserfahrung zu dieser Art von Job?')}
                    {renderQuestion(2, 'Wie qualifiziert fühlst du dich in Bezug auf die benötigte Ausbildung?')}
                    {renderQuestion(3, 'Wie gut passt dein technisches Wissen zu den Anforderungen?')}
                    {renderQuestion(4, 'Wie stark sind deine Soft Skills in Bezug auf die Rolle?')}
                    {renderQuestion(5, 'Wie viel Erfahrung hast du in der Branche, in der dieser Job ist?')}
                    {renderQuestion(6, 'Wie gut sind deine Sprachkenntnisse für diesen Job?')}
                    {renderQuestion(7, 'Wie flexibel bist du in Bezug auf Arbeitszeiten?')}
                    {renderQuestion(8, 'Wie bereit bist du zu reisen oder den Standort zu wechseln?')}
                    {renderQuestion(9, 'Wie wichtig sind dir Weiterbildung und Karrieremöglichkeiten?')}
                    {renderQuestion(10, 'Wie zufrieden wärst du mit der Vergütung und den Zusatzleistungen?')}
                  </>
                )}

                {view === 'results' && (
                  <>
                    <Heading as="h3" style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
                      Deine besten Job-Matches:
                    </Heading>
                    <ul>
                      {results.map((job, index) => (
                        <li key={index} style={{ marginBottom: '15px' }}>
                          <button
                            onClick={() => handleJobClick(job)}
                            style={{
                              background: 'none',
                              border: 'none',
                              textAlign: 'left',
                              color: '#0072c3',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              fontSize: '1.25rem'
                            }}
                          >
                            {job.job} ({job.percentage}%)
                          </button>
                        </li>
                      ))}
                    </ul>
                    <Button kind="secondary" size="lg" onClick={handleRestart}>Erneut starten</Button>
                  </>
                )}

                {view === 'details' && selectedJob && renderJobDetails()}
              </Form>
            )}
          </div>
        </main>
        <footer style={{ backgroundColor: '#f0f0f0', padding: '10px', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>© 2024 Jobfinder - All rights reserved.</p>
        </footer>
      </div>
    </Theme>
  );
};

export default JobFinder;