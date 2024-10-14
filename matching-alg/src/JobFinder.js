import React, { useState, useEffect } from 'react';
import { Button, Theme, Heading, Form } from '@carbon/react';
import '@carbon/styles/css/styles.css';
import jobData from './jobsTest.json'; // Pfad zur JSON-Datei anpassen
//import jobData from './jobs.json'; // Pfad zur JSON-Datei anpassen


const JobFinder = () => {
  const totalQuestions = 10;
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [started, setStarted] = useState(false);
  const [jobRequirements, setJobRequirements] = useState([]);
  const [maxScore, setMaxScore] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [view, setView] = useState('questions'); // Neue State-Variable für die aktuelle Ansicht

  useEffect(() => {
    if (jobData && jobData.jobs) {
      setJobRequirements(jobData.jobs);

      const max = jobData.jobs.reduce((acc, job) => {
        const jobMax = Object.values(job.requirements).reduce((sum, value) => sum + value, 0);
        return Math.max(acc, jobMax);
      }, 0);
      setMaxScore(max);
    } else {
      console.error('Job data is missing or not correctly formatted.');
    }
  }, []);

  const handleStart = () => {
    setStarted(true);
  };

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

  const handleSubmit = () => {
    if (Object.keys(answers).length < totalQuestions) {
      alert('Bitte beantworten Sie alle Fragen.');
      return;
    }

    const calculatedResults = calculateResults();
    setResults(calculatedResults);
    setShowResults(true);
    setCurrentQuestion(totalQuestions + 1);
    setView('results'); // Wechselt zur Ergebnisse-Ansicht
  };

  const handleRestart = () => {
    setAnswers({});
    setResults([]);
    setShowResults(false);
    setCurrentQuestion(1);
    setIsAnswered(false);
    setStarted(false);
    setSelectedJob(null);
    setView('questions'); // Setze die Ansicht zurück
  };

  const calculateResults = () => {
    if (!jobRequirements.length) return [];

    const jobScores = jobRequirements.map(job => {
      const requirements = job.requirements;
      let matchCount = 0;
      let totalQuestions = Object.keys(requirements).length;

      Object.keys(requirements).forEach(question => {
        if (requirements[question] === (answers[question] || 0)) {
          matchCount += 1;
        }
      });

      const percentage = (matchCount / totalQuestions) * 100;
      return { job: job.title, percentage: percentage.toFixed(2), url: job.url, additionalInfo: job.additionalInfo }; // Füge die zusätzlichen Informationen hinzu
    });

    jobScores.sort((a, b) => b.percentage - a.percentage);
    return jobScores.slice(0, 4);
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setView('details'); // Wechselt zur Detailansicht
  };

  const handleCloseDetails = () => {
    setSelectedJob(null);
    setView('results'); // Gehe zurück zu den Ergebnissen
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
      <p>{selectedJob.additionalInfo}</p> {/* Zusätzliche Informationen anzeigen */}
      <p>
        <Button kind="secondary" size="sm" onClick={handleCloseDetails}>Schließen</Button>
        <Button kind="primary" size="sm" onClick={() => window.open(selectedJob.url, '_blank')}>Jetzt bewerben</Button>
      </p>
    </div>
  );

  return (
    <Theme theme="white">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header
          onClick={handleRestart}
          style={{
            backgroundColor: '#333',
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
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f4f4f4', borderRadius: '12px', margin: '0 auto' }}>
                <Heading as="h1" style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '20px', color: '#333' }}>
                  Willkommen beim Jobfinder
                </Heading>
                <p style={{ fontSize: '1.5rem', color: '#666', marginBottom: '40px' }}>
                  Finde den Job, der am besten zu dir passt. Klicke auf den Button unten, um zu starten.
                </p>
                <Button kind="primary" size="xl" onClick={handleStart} style={{ fontSize: '1.5rem', padding: '12px 24px' }}>
                  Jetzt starten
                </Button>
              </div>
            ) : (
              <Form id="job-form" style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                {view === 'questions' && (
                  <>
                    {renderQuestion(1, 'Wie bewerten Sie Ihre Programmierkenntnisse?')}
                    {renderQuestion(2, 'Wie gut kennen Sie sich mit Datenbanken aus?')}
                    {renderQuestion(3, 'Wie gut sind Ihre Kenntnisse in Webentwicklung?')}
                    {renderQuestion(4, 'Wie sicher sind Sie im Umgang mit Versionierungssystemen?')}
                    {renderQuestion(5, 'Wie würden Sie Ihre Kommunikationsfähigkeiten bewerten?')}
                    {renderQuestion(6, 'Wie gut können Sie im Team arbeiten?')}
                    {renderQuestion(7, 'Wie sehr interessieren Sie sich für neue Technologien?')}
                    {renderQuestion(8, 'Wie wichtig ist Ihnen Work-Life-Balance?')}
                    {renderQuestion(9, 'Wie bewerten Sie Ihre Problemlösungsfähigkeiten?')}
                    {renderQuestion(10, 'Wie gut sind Ihre Kenntnisse im Projektmanagement?')}
                  </>
                )}
                {view === 'results' && (
                  <>
                    <Heading as="h2" style={{ marginBottom: '20px', fontSize: '2rem', fontWeight: '600', color: '#333' }}>
                      Ihre Ergebnisse
                    </Heading>
                    <div style={{ marginBottom: '20px' }}>
                      {results.length > 0 ? (
                        results.map((job, index) => (
                          <div key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                            <p style={{ fontSize: '1.5rem', margin: '0' }}>{job.job}</p>
                            <p>Dieser Job passt zu  {job.percentage}% zu dir</p>
                            <Button kind="tertiary" size="sm" onClick={() => handleJobClick(job)}>Mehr Informationen</Button>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#999' }}>Keine Ergebnisse gefunden.</p>
                      )}
                    </div>
                    <Button kind="primary" size="lg" onClick={handleRestart}>Neuen Test starten</Button>
                  </>
                )}
                {view === 'details' && selectedJob && renderJobDetails()} {/* Detailansicht */}
              </Form>
            )}
          </div>
        </main>
        <footer style={{ backgroundColor: '#333', color: '#fff', padding: '10px', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>© 2024 Jobfinder. Alle Rechte vorbehalten.</p>
        </footer>
      </div>
    </Theme>
  );
};

export default JobFinder;




