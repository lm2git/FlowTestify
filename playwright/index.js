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

const translateAndExecuteAndExtractSelectors = async (commands) => {
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

  const extractSelectors = async () => {
    return await page.evaluate(() => {
      const result = {
        click: [],
        type: [],
        waitForSelector: [],
        assert: []
      };

      // Funzione per ottenere un selettore dall'elemento
      function getElementSelector(el) {
        const id = el.id ? `#${el.id}` : '';
        const classes = el.classList.length > 0 ? `.${[...el.classList].join('.')}` : '';
        const name = el.name ? `[name="${el.name}"]` : '';
        const href = el.href ? `[href="${el.href}"]` : '';

        if (id) return id;
        if (classes) return `${el.tagName.toLowerCase()}${classes}`;
        if (name) return `${el.tagName.toLowerCase()}${name}`;
        if (href) return `${el.tagName.toLowerCase()}${href}`;
        return null;
      }

      // Raccogli selettori per i pulsanti, link, input, ecc.
      const clickElements = document.querySelectorAll('button[id], a[id], input[type="submit"][id], input[type="button"][id], input[type="image"][id], button[class], a[class], input[type="submit"][class], input[type="button"][class], input[type="image"][class], a[href]');
      clickElements.forEach(el => {
        const selector = getElementSelector(el);
        if (selector) result.click.push(selector);
      });

      const inputElements = document.querySelectorAll('input[id], input[type="text"][id], input[type="email"][id], input[type="password"][id], textarea[id], input[id][class], textarea[id][class], input[name], input[type], textarea[name], textarea[type]');
      inputElements.forEach(el => {
        const selector = getElementSelector(el);
        if (selector) result.type.push(selector);
      });

      const waitForElements = document.querySelectorAll('*[id], *[class]:not([class=""]), a[href]');
      waitForElements.forEach(el => {
        const selector = getElementSelector(el);
        if (selector) result.waitForSelector.push(selector);
      });

      const textElements = document.querySelectorAll('p[id], h1[id], h2[id], h3[id], div[id], span[id], p[class], h1[class], h2[class], h3[class], div[class], span[class], a[href]');
      textElements.forEach(el => {
        const selector = getElementSelector(el);
        if (el.innerText && (el.innerText.includes("HOME TESTI") || el.innerText.includes("TESTI CANTAUTORI"))) {
          result.assert.push(selector);
        }
      });

      return result;
    });
  };

  try {
    for (let command of commands) {
      const { action, args } = command;

      if (actionMap[action]) {
        console.log(`Eseguo azione: ${action} con argomenti: ${args}`);
        await actionMap[action](...args); // Esegui l'azione con gli argomenti
      } else {
        console.warn(`Azione '${action}' non supportata.`);
        throw new Error(`Azione non supportata: ${action}`);
      }
    }

    // Estrai i selettori alla fine del test
    const selectors = await extractSelectors();

    console.log("Test completato con successo. Selettori estratti:", selectors);
    return selectors; // Restituisci i selettori raccolti

  } catch (error) {
    console.error("Errore durante l'esecuzione del test:", error.message);
    throw error; // Propaga l'errore
  } finally {
    await browser.close(); // Chiudi sempre il browser
  }
};

app.post('/run-test-get-selectors', async (req, res) => {
  const { commands } = req.body;

  if (!Array.isArray(commands)) {
    return res.status(400).json({ error: 'Commands must be an array.' });
  }

  try {
    // Esegui il test con i comandi passati e raccogli i selettori
    const selectors = await translateAndExecuteAndExtractSelectors(commands);

    // Se tutto va a buon fine, restituisci i selettori
    res.json({ selectors });
  } catch (error) {
    // Se c'è un errore, restituisci il messaggio di errore
    res.status(500).json({ error: error.message });
  }
});


// Avvia il server
app.listen(port, () => {
  console.log(`API Playwright in ascolto su http://localhost:${port}`);
});
