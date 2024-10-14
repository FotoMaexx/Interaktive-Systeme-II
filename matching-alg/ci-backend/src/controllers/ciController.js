const path = require('path');

// Dummy CI-Daten
let corporateIdentity = {
  primaryColor: "#3498db",
  secondaryColor: "#2ecc71",
  fontFamily: "Arial, sans-serif",
  logoPath: "/uploads/default-logo.png" // Standardlogo
};

// Abrufen der aktuellen CI-Daten
exports.getCI = (req, res) => {
  res.json(corporateIdentity);
};

// Aktualisieren der CI-Daten (Farben, Schriftarten)
exports.updateCI = (req, res) => {
  const { primaryColor, secondaryColor, fontFamily } = req.body;

  if (primaryColor) corporateIdentity.primaryColor = primaryColor;
  if (secondaryColor) corporateIdentity.secondaryColor = secondaryColor;
  if (fontFamily) corporateIdentity.fontFamily = fontFamily;

  res.json({ message: 'Corporate Identity erfolgreich aktualisiert!', corporateIdentity });
};

// Hochladen des Firmenlogos
exports.uploadLogo = (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send('Kein Logo hochgeladen.');
  }

  // Speichere den Pfad des hochgeladenen Logos
  corporateIdentity.logoPath = `/uploads/${file.filename}`;

  res.json({ message: 'Logo erfolgreich hochgeladen!', logoPath: corporateIdentity.logoPath });
};
