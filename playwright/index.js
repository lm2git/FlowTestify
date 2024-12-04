const express = require('express');
const { chromium } = require('playwright');

const app = express();
const port = 3003;

app.use(express.json()); // Per gestire JSON nel corpo delle richieste

const translateAndExecute = async (commands) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const actionMap = {
    click: async (selector) => await page.click(selector),
    type: async (selector, value) => await page.fill(selector, value),
    navigate: async (url) => await page.goto(url),
    waitForSelector: async (selector) => await page.waitForSelector(selector),
    screenshot: async (path) => await page.screenshot({ path }),
    assert: async (selector, expectedValue) => {
      const element = await page.$(selector);
      if (!element) throw new Error(`Elemento non trovato: ${selector}`);
      const text = await element.innerText();
      if (text !== expectedValue) {
        throw new Error(`Valore atteso "${expectedValue}" ma trovato "${text}"`);
      }
    },
  };

  for (let command of commands) {
    const { action, args } = command;

    if (actionMap[action]) {
      try {
        console.log(`Eseguo azione: ${action} con argomenti: ${args}`);
        await actionMap[action](...args);
      } catch (error) {
        console.error(`Errore nell'azione '${action}' con argomenti '${args}':`, error.message);
        throw {
          message: error.message,
          action,
          args,
        }; // Ritorna dettagli completi sull'errore
      }
    } else {
      console.warn(`Azione '${action}' non supportata.`);
      throw {
        message: `Azione non supportata: ${action}`,
        action,
        args,
      };
    }
  }

  await browser.close();
  return 'Test completato con successo';
};


app.post('/run-test', async (req, res) => {
  const { commands } = req.body;

  if (!commands || !Array.isArray(commands)) {
    return res.status(400).json({ error: 'Comandi non validi o formato errato.' });
  }

  try {
    const result = await translateAndExecute(commands);
    res.status(200).json({ message: result });
  } catch (error) {
    console.error('Errore durante l\'esecuzione del test:', error);

    // Restituisci un errore dettagliato
    res.status(500).json({
      error: 'Errore durante l\'esecuzione del test.',
      message: error.message || 'Errore sconosciuto',
      action: error.action || null,
      args: error.args || [],
    });
  }
});

const translateAndExecuteSelector = async (commands) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Mappa delle azioni supportate
  const actionMap = {
    click: async (selector) => await page.click(selector),
    type: async (selector, value) => await page.fill(selector, value),
    navigate: async (url) => await page.goto(url),
    waitForSelector: async (selector) => await page.waitForSelector(selector),
    screenshot: async (path) => await page.screenshot({ path }),
    assert: async (selector, expectedValue) => {
      const element = await page.$(selector);
      if (!element) throw new Error(`Elemento non trovato: ${selector}`);
      const text = await element.innerText();
      if (text !== expectedValue) {
        throw new Error(`Valore atteso "${expectedValue}" ma trovato "${text}"`);
      }
    },
  };

  try {
    for (let command of commands) {
      const { action, args } = command;

      // Verifica che l'azione sia supportata
      if (actionMap[action]) {
        try {
          console.log(`Eseguo azione: ${action} con argomenti: ${args}`);
          await actionMap[action](...args); // Esegui l'azione con gli argomenti
        } catch (error) {
          console.error(`Errore nell'azione '${action}' con argomenti '${args}':`, error.message);
          throw new Error(`Errore nell'azione '${action}': ${error.message}`);
        }
      } else {
        // Gestisce il caso in cui l'azione non sia supportata
        console.warn(`Azione '${action}' non supportata.`);
        throw new Error(`Azione non supportata: ${action}`);
      }
    }
    
    console.log("Test completato con successo");
  } catch (error) {
    console.error("Errore durante l'esecuzione del test:", error.message);
    throw error; // Propaga l'errore
  } finally {
    // Chiudi sempre il browser, anche in caso di errore
    await browser.close();
  }

  return 'Test completato con successo';
};

app.post('/run-test-get-selectors', async (req, res) => {
  const { commands } = req.body;

  if (!Array.isArray(commands)) {
    return res.status(400).json({ error: 'Commands must be an array.' });
  }

  try {
    // Esegui il test con i comandi passati
    const result = await translateAndExecuteSelector(commands);

    // Se tutto va a buon fine, restituisci il risultato
    res.json({ message: result });
  } catch (error) {
    // Se c'è un errore, restituisci il messaggio di errore
    res.status(500).json({ error: error.message });
  }
});


// Avvia il server
app.listen(port, () => {
  console.log(`API Playwright in ascolto su http://localhost:${port}`);
});
