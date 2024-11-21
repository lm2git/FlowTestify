const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());  // Questo middleware è già presente, ma aggiungeremo il controllo per il tipo di contenuto

// Middleware per verificare che il tipo di contenuto sia JSON
app.use((req, res, next) => {
  if (req.headers['content-type'] !== 'application/json') {
    console.warn(`[FlowTestify] Request body should be in JSON format. Received: ${req.headers['content-type']}`);
    return res.status(400).json({ message: 'Request body must be in JSON format' });
  }
  next();  // Se è JSON, passa alla richiesta successiva
});

// Middleware per CORS (già presente)
app.use(cors());

// Load Routes
const routes = require('./routes');
app.use('/api', routes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[FlowTestify] Error:', err.message);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// Start Server Function
const startServer = async () => {
  try {
    // Database Connection
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('[FlowTestify] Connected to MongoDB');

    // Start Express Server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`[FlowTestify] Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[FlowTestify] Failed to start the server:', err.message);
    process.exit(1); // Exit the process with failure
  }
};

// Initialize the Server
startServer();
