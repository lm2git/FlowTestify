const express = require('express');
const { chromium } = require('playwright');

const app = express();
const port = 3003;

app.use(express.json()); // Per gestire JSON nel corpo delle richieste

// Funzione per tradurre i comandi e mappare l'azione in Playwright
const translateAndExecute = async (commands) => {
  // Avvia il browser e la pagina
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Mappa delle azioni che corrispondono agli actionType
  const actionMap = {
    click: async (selector) => await page.click(selector),
    type: async (selector, value) => await page.fill(selector, value),
    navigate: async (url) => await page.goto(url), // Per l'azione 'navigate'
    waitForSelector: async (selector) => await page.waitForSelector(selector),
    screenshot: async (path) => await page.screenshot({ path }), // Per lo screenshot
    assert: async (selector, expectedValue) => {
      const element = await page.$(selector);
      const text = await element.innerText();
      if (text !== expectedValue) {
        throw new Error(`Expected value "${expectedValue}" but got "${text}"`);
      }
    },
  };

  // Esegui i comandi passati
  for (let command of commands) {
    const { action, args } = command;

    // Controlla se l'azione esiste nella actionMap
    if (actionMap[action]) {
      try {
        console.log(`Eseguo azione: ${action} con argomenti: ${args}`);
        await actionMap[action](...args); // Esegui l'azione con gli argomenti
      } catch (error) {
        console.error(`Errore durante l'esecuzione dell'azione '${action}':`, error.message);
        throw error; // Propaga l'errore
      }
    } else {
      console.warn(`Azione '${action}' non riconosciuta.`);
      throw new Error(`Azione non supportata: ${action}`);
    }
  }

  // Chiudi il browser dopo aver eseguito tutti i comandi
  await browser.close();
  return 'Test completato con successo';
};

// Endpoint per eseguire il test
app.post('/run-test', async (req, res) => {
  const { commands } = req.body;

  if (!commands || !Array.isArray(commands)) {
    return res.status(400).json({ error: 'Comandi non validi o formato errato.' });
  }

  try {
    const result = await translateAndExecute(commands); // Esegui i comandi
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'esecuzione del test.', details: error.message });
  }
});

// Avvia il server
app.listen(port, () => {
  console.log(`API Playwright in ascolto su http://localhost:${port}`);
});
