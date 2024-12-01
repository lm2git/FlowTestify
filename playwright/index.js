const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

app.post('/run-test', async (req, res) => {
  const { steps } = req.body;
  console.log('Ricevuto steps:', steps);  // Aggiungi questo log per debuggare

  if (!steps || !Array.isArray(steps)) {
    return res.status(400).send({ message: 'Steps non validi' });
  }

  try {
    // Crea una nuova istanza di browser
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Esegui ogni step
    for (const step of steps) {
      console.log(`Eseguo step: ${step.actionType}`);
      switch (step.actionType) {
        case 'screenshot':
          await page.screenshot({ path: `screenshot-${Date.now()}.png` });
          break;
        case 'click':
          await page.click(step.selector);
          break;
        case 'type':
          await page.type(step.selector, step.value);
          break;
        default:
          console.warn(`Azione non supportata: ${step.actionType}`);
      }
    }

    await browser.close();
    res.status(200).send({ message: 'Test completato con successo' });
  } catch (error) {
    console.error('Errore durante l\'esecuzione del test:', error);
    res.status(500).send({ message: 'Errore durante l\'esecuzione del test' });
  }
});

app.listen(3003, () => {
  console.log('Playwright server in ascolto su porta 3003');
});
