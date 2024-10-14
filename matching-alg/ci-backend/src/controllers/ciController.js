const fs = require('fs');
const path = require('path');

const ciFilePath = path.join(__dirname, '..', 'ci-data.json');  // Pfad zur Datei, in der die CI-Daten gespeichert werden

// CI-Daten abrufen
exports.getCI = (req, res) => {
  fs.readFile(ciFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Fehler beim Lesen der CI-Daten:', err);
      return res.status(500).send('Fehler beim Abrufen der CI-Daten.');
    }
    res.json(JSON.parse(data));
  });
};

// CI-Daten aktualisieren
exports.updateCI = (req, res) => {
  const newCI = req.body;

  // Die neuen CI-Daten in der JSON-Datei speichern
  fs.writeFile(ciFilePath, JSON.stringify(newCI, null, 2), (err) => {
    if (err) {
      console.error('Fehler beim Speichern der CI-Daten:', err);
      return res.status(500).send('Fehler beim Speichern der CI-Daten.');
    }
    res.json({ message: 'CI erfolgreich aktualisiert', corporateIdentity: newCI });
  });
};

// Funktion zum Hochladen eines Logos
exports.uploadLogo = (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('Kein Logo hochgeladen.');
  }
  res.json({ message: 'Logo erfolgreich hochgeladen', logoPath: `/uploads/${file.filename}` });
};

// Funktion zum Hochladen der Jobdaten

const configPath = path.join(__dirname, '../..', 'config.json');

exports.uploadJobsJson = (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('Keine JSON-Datei hochgeladen.');
  }

  const filePath = path.join(__dirname, '../..', 'uploads', file.filename);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Fehler beim Lesen der Datei:', err);
      return res.status(500).send('Fehler beim Lesen der Datei.');
    }

    try {
      const parsedData = JSON.parse(data);
      if (!parsedData.jobs) {
        return res.status(400).send('Ungültiges JSON-Format. "jobs" Array fehlt.');
      }

      // Dateinamen speichern
      fs.writeFile(configPath, JSON.stringify({ uploadedFileName: file.filename }), (err) => {
        if (err) {
          console.error('Fehler beim Speichern der Datei:', err);
          return res.status(500).send('Fehler beim Speichern der Konfigurationsdatei.');
        }
        res.json({ message: 'Jobdaten erfolgreich hochgeladen!', jobData: parsedData });
      });
    } catch (parseError) {
      console.error('Fehler beim Parsen der JSON-Datei:', parseError);
      return res.status(400).send('Ungültiges JSON-Format.');
    }
  });
};

// Abrufen der Jobdaten
let uploadedFileName = '';

exports.getJobs = (req, res) => {
  // Lade den Dateinamen beim Start
  fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Fehler beim Lesen der Konfigurationsdatei:', err);
      return res.status(500).send('Fehler beim Laden der Jobdaten.');
    }

    try {
      const config = JSON.parse(data);
      uploadedFileName = config.uploadedFileName;

      if (!uploadedFileName) {
        return res.status(400).send('Keine Jobdaten verfügbar.');
      }

      const filePath = path.join(__dirname, '../..', 'uploads', uploadedFileName);

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Fehler beim Lesen der Jobdatei:', err);
          return res.status(500).send('Fehler beim Laden der Jobdaten.');
        }

        try {
          const parsedData = JSON.parse(data);
          res.json(parsedData);  // Sende die Jobdaten zurück
        } catch (parseError) {
          console.error('Fehler beim Parsen der Jobdatei:', parseError);
          return res.status(400).send('Ungültiges Jobdaten-Format.');
        }
      });
    } catch (parseError) {
      console.error('Fehler beim Parsen der Konfigurationsdatei:', parseError);
      return res.status(400).send('Ungültige Konfigurationsdatei.');
    }
  });
};