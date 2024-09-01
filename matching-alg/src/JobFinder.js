import React, { useState, useEffect } from 'react';
import { Button, Theme, Heading, Form, InlineNotification } from '@carbon/react';
import '@carbon/styles/css/styles.css';
import jobData from './jobsTest.json'; // Pfad zur JSON-Datei anpassen

const JobFinder = () => {
  const totalQuestions = 10;
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [started, setStarted] = useState(false);
  const [jobRequirements, setJobRequirements] = useState([]);
  const [maxScore, setMaxScore] = useState(0);

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
  };

  const handleRestart = () => {
    setAnswers({});
    setResults('');
    setShowResults(false);
    setCurrentQuestion(1);
    setIsAnswered(false);
    setStarted(false);
  };

  const handleHeaderClick = () => {
    if (started) {
      handleRestart();
    }
  };

  const calculateResults = () => {
    if (!jobRequirements.length) return '';
  
    const jobScores = jobRequirements.map(job => {
      const requirements = job.requirements;
      let matchCount = 0;
      let totalQuestions = Object.keys(requirements).length;
  
      // Zähle die Übereinstimmungen für jede Frage
      Object.keys(requirements).forEach(question => {
        if (requirements[question] === (answers[question] || 0)) {
          matchCount += 1;
        }
      });
  
      // Berechne den Prozentsatz der Übereinstimmungen
      const percentage = (matchCount / totalQuestions) * 100;
      return { job: job.title, percentage: percentage.toFixed(2) };
    });
  
    // Sortiere die Jobs nach Übereinstimmung und nimm die Top 4
    jobScores.sort((a, b) => b.percentage - a.percentage);
    const topJobs = jobScores.slice(0, 4);
    
    // Formatiere die Ergebnisse für die Anzeige
    return topJobs.map(jobScore => `<p>${jobScore.job}: ${jobScore.percentage}% Übereinstimmung</p>`).join('');
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

  return (
    <Theme theme="white">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header
          onClick={handleHeaderClick}
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
                {renderQuestion(1, 'Erforderliche Berufserfahrung')}
                {renderQuestion(2, 'Erforderliche Ausbildung und Qualifikationen')}
                {renderQuestion(3, 'Technische Fähigkeiten')}
                {renderQuestion(4, 'Soft Skills')}
                {renderQuestion(5, 'Branchenerfahrung')}
                {renderQuestion(6, 'Sprachkenntnisse')}
                {renderQuestion(7, 'Arbeitszeit und Flexibilität')}
                {renderQuestion(8, 'Reisebereitschaft und Standort')}
                {renderQuestion(9, 'Karriereentwicklung und Weiterbildungsangebote')}
                {renderQuestion(10, 'Vergütung und Zusatzleistungen')}

                {showResults && (
                  <div className="question" style={{ marginTop: '40px' }}>
                    <Heading as="h3" style={{ marginBottom: '20px', fontSize: '2rem', fontWeight: '600', color: '#333' }}>Ihre Ergebnisse</Heading>
                    <div id="results-content" dangerouslySetInnerHTML={{ __html: results }} style={{ marginBottom: '30px', color: '#666', fontSize: '1.25rem' }} />
                    <Button kind="primary" size="lg" onClick={handleRestart} style={{ width: '100%' }}>Nochmal starten</Button>
                  </div>
                )}
                {Object.keys(answers).length < totalQuestions && (
                  <InlineNotification
                    kind="error"
                    title="Unvollständige Antworten"
                    subtitle="Bitte beantworten Sie alle Fragen, bevor Sie fortfahren."
                    style={{ marginTop: '40px', fontSize: '1.25rem' }}
                  />
                )}
              </Form>
            )}
          </div>
        </main>
      </div>
    </Theme>
  );
};

export default JobFinder;















