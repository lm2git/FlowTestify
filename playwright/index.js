const { chromium } = require('playwright');  // Import Playwright

const runTest = async (req, res) => {
  const { testId } = req.params;

  try {
    const test = await Test.findById(testId).populate('steps');

    if (!test) {
      return res.status(404).json({ message: 'Test non trovato' });
    }

    if (!test.steps || test.steps.length === 0) {
      return res.status(400).json({ message: 'Il test non ha nessun step definito.' });
    }

    // Imposta lo stato a 'pending' prima dell'esecuzione
    test.status = 'pending';
    test.message = 'no error detail';  // Setta il messaggio predefinito
    await test.save();

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Attiva la modalità debug di Playwright
    page.on('console', msg => {
      console.log('Playwright log:', msg.text());
    });

    for (const step of test.steps) {
      try {
        switch (step.actionType) {
          case 'navigate':
            console.log(`Navigando verso ${step.url}`);
            await page.goto(step.url);
            break;
          case 'click':
            console.log(`Cliccando su ${step.selector}`);
            await page.click(step.selector);
            break;
          case 'type':
            console.log(`Digitando '${step.value}' nel campo ${step.selector}`);
            await page.type(step.selector, step.value);
            break;
          case 'waitForSelector':
            console.log(`Aspettando il selettore ${step.selector}`);
            await page.waitForSelector(step.selector);
            break;
          case 'assert':
            console.log(`Verifica del valore atteso '${step.expectedValue}' per il selettore ${step.selector}`);
            const element = await page.$(step.selector);
            const text = await element.innerText();
            if (text !== step.expectedValue) {
              throw new Error(`Valore atteso non corrisponde: '${step.expectedValue}', trovato: '${text}'`);
            }
            break;
          case 'screenshot':
            console.log(`Scattando screenshot per ${step.screenshotPath}`);
            await page.screenshot({ path: step.screenshotPath });
            break;
          default:
            throw new Error(`Azione sconosciuta: ${step.actionType}`);
        }
      } catch (error) {
        // Log dell'errore per lo step specifico
        console.error(`Errore durante lo step ${step.actionType}:`, error);
        
        // Aggiorna il test con stato di fallimento e messaggio di errore specifico
        test.status = 'failure';
        test.message = `Errore durante lo step ${step.actionType}: ${error.message}`;
        await test.save();
        
        // Restituisce il messaggio di errore al frontend
        return res.status(500).json({
          message: 'Errore durante l\'esecuzione del test',
          error: error.message,
          step: step.actionType,  // Fornisce il tipo di step fallito
          selector: step.selector,  // Fornisce il selettore relativo
        });
      }
    }

    // Chiudi il browser
    await browser.close();

    // Imposta lo stato e messaggio di successo
    test.status = 'success';
    test.message = 'ok';  // Test riuscito, quindi messaggio 'ok'
    await test.save();

    return res.status(200).json({ message: 'Test completato con successo', test });
  } catch (error) {
    console.error('Errore durante l\'esecuzione del test:', error);

    const test = await Test.findById(testId);
    if (test) {
      test.status = 'failure';
      test.message = `error: ${error.message}`;  // Messaggio di errore generico
      await test.save();
    }

    return res.status(500).json({
      message: 'Errore durante l\'esecuzione del test',
      error: error.message,
    });
  }
};
