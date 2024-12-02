const express = require('express');
const { chromium } = require('playwright');

const app = express();
const port = 3003;

app.use(express.json()); // Per gestire JSON nel corpo delle richieste

// Funzione per tradurre comandi user-friendly in azioni Playwright
const translateAndExecute = async (commands) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Mappa dei comandi e delle azioni Playwright
  const actionMap = {
    "vai su": async (url) => await page.goto(url), // Azione 'navigate'
    "clicca su": async (selector) => await page.click(selector),
    "clicca sul bottone": async (selector) => await page.click(selector),
    "riempi il campo": async (selector, text) => await page.fill(selector, text),
    "aspetta il campo": async (selector) => await page.waitForSelector(selector),
    "verifica se il campo è visibile": async (selector) => {
      const visible = await page.isVisible(selector);
      console.log(`Il campo ${selector} è visibile: ${visible}`);
    },
    "seleziona l'opzione": async (selector, value) => await page.selectOption(selector, value),
    "chiudi il browser": async () => await browser.close(),
  };

  // Esegui i comandi
  for (let command of commands) {
    const { action, args } = command;
    if (actionMap[action]) {
      try {
        console.log(`Eseguo azione: ${action} con argomenti: ${args}`);
        await actionMap[action](...args); // Passa gli argomenti
      } catch (error) {
        console.error(`Errore durante l'esecuzione di '${action}':`, error.message);
        throw error;
      }
    } else {
      console.warn(`Azione '${action}' non riconosciuta.`);
      throw new Error(`Azione non supportata: ${action}`);
    }
  }

  return 'Test completato con successo';
};

// Endpoint API per eseguire i comandi
app.post('/run-test', async (req, res) => {
  const { commands } = req.body;

  if (!commands || !Array.isArray(commands)) {
    return res.status(400).json({ error: 'Comandi non validi o formato errato.' });
  }

  try {
    const result = await translateAndExecute(commands);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'esecuzione del test.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`API Playwright in ascolto su http://localhost:${port}`);
});
