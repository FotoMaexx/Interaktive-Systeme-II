import React, { useState } from 'react';
import { RadioButtonGroup, RadioButton } from 'carbon-components-react';
import { Button } from 'carbon-components-react';

const JobFinder = () => {
  const totalQuestions = 11; // Anzahl der Fragen
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleChange = (question, value) => {
    setAnswers({
      ...answers,
      [question]: value,
    });
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
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
    setCurrentQuestion(totalQuestions + 1); // Kein nächstes Fragefeld mehr
  };

  const handleRestart = () => {
    setAnswers({});
    setResults('');
    setShowResults(false);
    setCurrentQuestion(1);
  };

  const calculateResults = () => {
    const jobRequirements = {
      Architekt: { question1: 5, question2: 5, question3: 5, question4: 0, question5: 0, question6: 0, question7: 0, question8: 0, question9: 0, question10: 0, question11: 0 },
      Lehrer: { question1: 0, question2: 0, question3: 0, question4: 5, question5: 5, question6: 5, question7: 0, question8: 0, question9: 0, question10: 0, question11: 0 },
      Arzt: { question1: 0, question2: 0, question3: 0, question4: 0, question5: 0, question6: 0, question7: 5, question8: 5, question9: 5, question10: 5, question11: 5 }
    };

    const maxScore = 55; // Maximale Punktzahl (5 * Anzahl der Fragen)
    const jobScores = Object.keys(jobRequirements).map(job => {
      const requirements = jobRequirements[job];
      let score = 0;
      Object.keys(requirements).forEach(question => {
        score += Math.abs(requirements[question] - (answers[question] || 0));
      });
      const percentage = 100 - (score / maxScore * 100);
      return { job, percentage: percentage.toFixed(2) };
    });

    jobScores.sort((a, b) => b.percentage - a.percentage); // Sortieren nach Übereinstimmung in absteigender Reihenfolge
    return jobScores.map(jobScore => `<p>${jobScore.job}: ${jobScore.percentage}% Übereinstimmung</p>`).join('');
  };

  const renderQuestion = (questionNumber, questionText) => (
    <div style={{ display: currentQuestion === questionNumber ? 'block' : 'none' }}>
      <h2>{questionText}</h2>
      <p>Frage {questionNumber} von {totalQuestions}</p> {/* Dynamische Fortschritt-Anzeige */}
      <RadioButtonGroup
        name={`question${questionNumber}`}
        valueSelected={answers[`question${questionNumber}`]}
        onChange={(value) => handleChange(`question${questionNumber}`, value)}
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <RadioButton
            key={value}
            id={`radio-${questionNumber}-${value}`}
            value={value.toString()}
            labelText={value === 1 ? 'Keine' : value === 5 ? 'Sehr starkes Interesse' : ''}
          />
        ))}
      </RadioButtonGroup>
      <div className="button-group">
        {questionNumber > 1 && (
          <Button kind="secondary" size="md" onClick={handlePrev}>Zurück</Button>
        )}
        {questionNumber < totalQuestions ? (
          <Button kind="primary" size="md" onClick={handleNext}>Weiter</Button>
        ) : (
          <Button kind="primary" size="md" onClick={handleSubmit}>Ergebnisse evaluieren</Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="container">
      <h1>Jobfinder</h1>
      <form id="job-form">
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
          <div className="question">
            <h2>Ihre Ergebnisse</h2>
            <div id="results-content" dangerouslySetInnerHTML={{ __html: results }} />
            <Button kind="primary" size="md" onClick={handleRestart}>Nochmal starten</Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default JobFinder;

