require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ciRoutes = require('./routes/ciRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

console.log("Server wird gestartet...");

// Middleware
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Routen
app.use('/api/ci', ciRoutes);

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
