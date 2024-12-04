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

/**
 * Endpoint: POST /run-test-get-selectors
 * Descrizione: Esegue i comandi forniti, raccoglie i selettori dall'ultima pagina e li restituisce in JSON.
 */
app.post('/run-test-get-selectors', async (req, res) => {
  const { commands } = req.body;

  // Verifica che i comandi siano forniti correttamente
  if (!Array.isArray(commands)) {
    console.error('[RunTest] Error: "commands" must be an array.');
    return res.status(400).json({ error: 'Commands must be an array.' });
  }

  let browser;
  try {
    // Avvia il browser Playwright in modalità headless
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('[RunTest] Browser launched in headless mode and new page created.');

    // Esegui i comandi forniti
    for (const command of commands) {
      const { action, selector, value } = command;
      console.log(`[RunTest] Executing command: ${JSON.stringify(command)}`);

      switch (action) {
        case 'goto':
          await page.goto(value);
          console.log(`[RunTest] Navigated to URL: ${value}`);
          break;
        case 'click':
          await page.click(selector);
          console.log(`[RunTest] Clicked on selector: ${selector}`);
          break;
        case 'type':
          await page.type(selector, value);
          console.log(`[RunTest] Typed value: "${value}" into selector: ${selector}`);
          break;
        case 'waitForSelector':
          await page.waitForSelector(selector);
          console.log(`[RunTest] Waiting for selector: ${selector}`);
          break;
        default:
          console.warn(`[RunTest] Unknown action: ${action}`);
      }
    }

    // Estrai i selettori dall'ultima pagina
    const selectors = await page.evaluate(() => {
      const result = {
        click: [],
        type: [],
        waitForSelector: [],
        assert: []
      };

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

      console.log('[RunTest] Extracting selectors from the page.');

      // Raccogli i selettori per ogni categoria
      const clickElements = document.querySelectorAll('button, a, input[type="submit"], input[type="button"], input[type="image"]');
      clickElements.forEach(el => {
        const selector = getElementSelector(el);
        if (selector) result.click.push(selector);
      });

      const inputElements = document.querySelectorAll('input, textarea');
      inputElements.forEach(el => {
        const selector = getElementSelector(el);
        if (selector) result.type.push(selector);
      });

      const waitForElements = document.querySelectorAll('*[id], *[class]:not([class=""]), a[href]');
      waitForElements.forEach(el => {
        const selector = getElementSelector(el);
        if (selector) result.waitForSelector.push(selector);
      });

      const textElements = document.querySelectorAll('p, h1, h2, h3, div, span, a');
      textElements.forEach(el => {
        const selector = getElementSelector(el);
        if (el.innerText && (el.innerText.includes("HOME TESTI") || el.innerText.includes("TESTI CANTAUTORI"))) {
          result.assert.push(selector);
        }
      });

      console.log('[RunTest] Selectors extraction completed.');
      return result;
    });

    console.log('[RunTest] Selectors successfully extracted:', selectors);

    // Chiudi il browser e restituisci i selettori
    await browser.close();
    res.json({ selectors });
  } catch (error) {
    console.error('[RunTest] Error during execution:', error);

    if (browser) {
      await browser.close();
    }
    res.status(500).json({ error: error.message });
  }
});


// Avvia il server
app.listen(port, () => {
  console.log(`API Playwright in ascolto su http://localhost:${port}`);
});
