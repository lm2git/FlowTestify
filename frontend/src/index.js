import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';  // Importa il componente principale
import './css/styles.css';  // Importa il file CSS di base

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
