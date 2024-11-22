const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Middleware per CORS
app.use(cors());

// Load Routes
const routes = require('./routes');
app.use('/api', routes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[FlowTestify] Error:', err.message);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// WebSocket setup
const wss = new WebSocket.Server({ noServer: true }); // noServer: true permette l'integrazione con il server HTTP di Express

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Integrazione WebSocket con il server HTTP di Express
app.server = app.listen(process.env.PORT || 3000, () => {
  console.log(`[FlowTestify] Server is running on port ${process.env.PORT || 3000}`);
});

app.server.on('upgrade', (request, socket, head) => {
  // Gestisce le richieste di upgrade WebSocket
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Database Connection
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('[FlowTestify] Connected to MongoDB');
  } catch (err) {
    console.error('[FlowTestify] Failed to start the server:', err.message);
    process.exit(1); // Exit the process with failure
  }
};

// Initialize the Server
startServer();
