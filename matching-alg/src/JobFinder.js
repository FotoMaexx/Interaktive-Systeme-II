import React, { useState } from 'react';
import { RadioButtonGroup, RadioButton, Button, Theme, Grid, Column, Form, Heading, InlineNotification } from '@carbon/react';
import '@carbon/styles/css/styles.css';

const JobFinder = () => {
  const totalQuestions = 11;
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [started, setStarted] = useState(false);

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
    const jobRequirements = {
      Architekt: { question1: 5, question2: 5, question3: 5, question4: 0, question5: 0, question6: 0, question7: 0, question8: 0, question9: 0, question10: 0, question11: 0 },
      Lehrer: { question1: 0, question2: 0, question3: 0, question4: 5, question5: 5, question6: 5, question7: 0, question8: 0, question9: 0, question10: 0, question11: 0 },
      Arzt: { question1: 0, question2: 0, question3: 0, question4: 0, question5: 0, question6: 0, question7: 5, question8: 5, question9: 5, question10: 5, question11: 5 }
    };

    const maxScore = 55;
    const jobScores = Object.keys(jobRequirements).map(job => {
      const requirements = jobRequirements[job];
      let score = 0;
      Object.keys(requirements).forEach(question => {
        score += Math.abs(requirements[question] - (answers[question] || 0));
      });
      const percentage = 100 - (score / maxScore * 100);
      return { job, percentage: percentage.toFixed(2) };
    });

    jobScores.sort((a, b) => b.percentage - a.percentage);
    return jobScores.map(jobScore => `<p>${jobScore.job}: ${jobScore.percentage}% Übereinstimmung</p>`).join('');
  };

  const renderQuestion = (questionNumber, questionText) => (
    <div style={{ display: currentQuestion === questionNumber ? 'block' : 'none', marginBottom: '40px' }}>
      <Heading as="h3" style={{ marginBottom: '20px', fontSize: '2rem', fontWeight: '600', color: '#333' }}>
        {questionText}
      </Heading>
      <p style={{ marginBottom: '20px', color: '#666', fontSize: '1.25rem' }}>Frage {questionNumber} von {totalQuestions}</p>
      <RadioButtonGroup
        orientation="vertical"
        name={`question${questionNumber}`}
        valueSelected={answers[`question${questionNumber}`]}
        onChange={(value) => handleChange(`question${questionNumber}`, value)}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <RadioButton
            key={value}
            id={`radio-${questionNumber}-${value}`}
            value={value.toString()}
            labelText={value === 1 ? 'Keine' : value === 5 ? 'Sehr starkes Interesse' : `Stufe ${value}`}
            style={{ marginBottom: '10px', fontSize: '1.25rem', padding: '10px' }}
          />
        ))}
      </RadioButtonGroup>
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
                {renderQuestion(1, 'Besitzen Sie mathematisches und technisches Verständnis?')}
                {renderQuestion(2, 'Sind Sie kreativ und haben Ideen für neue Designs?')}
                {renderQuestion(3, 'Haben Sie räumliches Vorstellungsvermögen?')}
                {renderQuestion(4, 'Arbeiten Sie gerne mit Kindern/Jugendlichen?')}
                {renderQuestion(5, 'Haben Sie eine hohe Stresskapazität?')}
                {renderQuestion(6, 'Besitzen Sie Durchsetzungsfähigkeit und Empathie?')}
                {renderQuestion(7, 'Interessieren Sie sich für die Abläufe des menschlichen Organismus?')}
                {renderQuestion(8, 'Haben Sie Spaß dabei, anderen Menschen zu helfen?')}
                {renderQuestion(9, 'Sind Sie sorgfältig und zuverlässig?')}
                {renderQuestion(10, 'Arbeiten Sie gerne im Team?')}
                {renderQuestion(11, 'Haben Sie Interesse an neuen Medikationen?')}

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








