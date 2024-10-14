import React, { useState, useEffect } from 'react';
import {
  Button,
  Form,
  FileUploader,
  Theme,
  Heading,
} from '@carbon/react';
import '@carbon/styles/css/styles.css';
import { ChromePicker } from 'react-color'; // Importiere den ChromePicker

function App() {
  const [ciData, setCiData] = useState({
    primaryColor: '#fff',
    secondaryColor: '#000',
    logoPath: '/uploads/default-logo.png'
  });
  const [logo, setLogo] = useState(null);
  const [jobJsonFile, setJobJsonFile] = useState(null); // Variable für Jobdaten-JSON-Datei
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false); // Zeigt den Primary Color Picker
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false); // Zeigt den Secondary Color Picker

  // Fetch current CI data from the backend
  useEffect(() => {
    fetch('http://localhost:5001/api/ci')
      .then((response) => {
        // Überprüfe den Status der Antwort
        if (!response.ok) {
          console.error(`Fehler: ${response.status}`);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Versuche, die Antwort als Text zu lesen
        return response.text();  // Wir lesen sie erst als Text
      })
      .then((data) => {
        console.log('Rohdaten:', data);  // Die Rohdaten loggen
        // Versuche, die Antwort in JSON zu konvertieren
        try {
          const jsonData = JSON.parse(data);
          setCiData(jsonData);  // Die CI-Daten setzen
        } catch (parseError) {
          console.error('Fehler beim Parsen der JSON-Daten:', parseError);
        }
      })
      .catch((error) => console.error('Fehler beim Abrufen der CI-Daten:', error));
  }, []);


  const handleSubmit = (e) => {
    e.preventDefault();
    
    fetch('http://localhost:5001/api/ci', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ciData),  // Die CI-Daten, die aktualisiert werden sollen
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('Erfolgreiches Update:', data);  // Erfolgreiches Update loggen
      alert('CI erfolgreich aktualisiert!');
      setCiData(data.corporateIdentity);  // Aktualisierte CI-Daten setzen
    })
    .catch((error) => {
      console.error('Fehler beim Aktualisieren der CI-Daten:', error);
    });
  };

  const handleLogoUpload = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('logo', logo);

    fetch('http://localhost:5001/api/ci/upload-jobs', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        alert('Logo uploaded successfully!');
        setCiData(prevState => ({ ...prevState, logoPath: data.logoPath }));
      })
      .catch(error => console.error('Error uploading logo:', error));
  };

  // Neuer Upload für die Jobdaten
  const handleJobJsonUpload = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('jsonFile', jobJsonFile); // Jobdaten-JSON-Datei anhängen

    fetch('http://localhost:5001/api/ci/upload-jobs', {  // Der API-Endpunkt für das Hochladen der Jobdaten
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        alert('Jobdaten erfolgreich hochgeladen!');
      })
      .catch(error => console.error('Error uploading Job JSON:', error));
  };

  return (
    <Theme theme="white">
      <div style={{ padding: '20px' }}>
        <Heading as="h1" style={{ marginBottom: '20px' }}>Corporate Identity Management</Heading>

        {/* CI-Formular */}
        <Form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <label>Primary Color</label>
            <div
              style={{
                display: 'inline-block',
                width: '36px',
                height: '36px',
                backgroundColor: ciData.primaryColor,
                border: '1px solid #000',
                cursor: 'pointer',
              }}
              onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
            />
            {showPrimaryPicker && (
              <div style={{ position: 'absolute', zIndex: 2 }}>
                <ChromePicker
                  color={ciData.primaryColor}
                  onChange={color => setCiData({ ...ciData, primaryColor: color.hex })}
                  onClose={() => setShowPrimaryPicker(false)}
                />
              </div>
            )}
          </div>
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <label>Secondary Color</label>
            <div
              style={{
                display: 'inline-block',
                width: '36px',
                height: '36px',
                backgroundColor: ciData.secondaryColor,
                border: '1px solid #000',
                cursor: 'pointer',
              }}
              onClick={() => setShowSecondaryPicker(!showSecondaryPicker)}
            />
            {showSecondaryPicker && (
              <div style={{ position: 'absolute', zIndex: 2 }}>
                <ChromePicker
                  color={ciData.secondaryColor}
                  onChange={color => setCiData({ ...ciData, secondaryColor: color.hex })}
                  onClose={() => setShowSecondaryPicker(false)}
                />
              </div>
            )}
          </div>
          <Button type="submit">Update CI</Button>
        </Form>

        <hr style={{ margin: '40px 0' }} />

        {/* Logo Upload */}
        <Heading as="h2" style={{ marginBottom: '20px' }}>Logo Upload</Heading>
        <Form onSubmit={handleLogoUpload}>
          <FileUploader
            buttonLabel="Add Logo"
            labelTitle="Upload your company logo"
            filenameStatus="edit"
            onChange={e => setLogo(e.target.files[0])}
          />
          <Button type="submit" style={{ marginTop: '20px' }}>Upload Logo</Button>
        </Form>

        {ciData.logoPath && (
          <div style={{ marginTop: '20px' }}>
            <img src={ciData.logoPath} alt="Company Logo" style={{ width: '150px' }} />
          </div>
        )}

        <hr style={{ margin: '40px 0' }} />

        {/* Jobdaten Upload */}
        <Heading as="h2" style={{ marginBottom: '20px' }}>Jobdaten Upload</Heading>
        <Form onSubmit={handleJobJsonUpload}>  {/* Formular für den Upload der Jobdaten */}
          <FileUploader
            buttonLabel="Upload Jobdaten"
            labelTitle="Lade deine Jobdaten hoch (JSON)"
            filenameStatus="edit"
            onChange={e => setJobJsonFile(e.target.files[0])}  // Verwalte das hochgeladene Jobdaten-JSON
          />
          <Button type="submit" style={{ marginTop: '20px' }}>Jobdaten hochladen</Button>
        </Form>
      </div>
    </Theme>
  );
}

export default App;
