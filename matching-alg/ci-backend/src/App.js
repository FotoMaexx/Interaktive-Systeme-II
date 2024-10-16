const express = require('express');
const cors = require('cors');  // CORS-Paket einbinden
const bodyParser = require('body-parser');
const ciRoutes = require('./routes/ciRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

// CORS-Optionen festlegen
const corsOptions = {
  origin: '*', // Erlaubt nur Requests von localhost:3000
  methods: 'GET,POST',  // Erlaubt GET und POST-Anfragen
  allowedHeaders: 'Content-Type',  // Erlaubt Header Content-Type
};

// CORS für alle Routen aktivieren
app.use(cors(corsOptions));

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
