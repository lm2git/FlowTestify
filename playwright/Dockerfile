# Usa l'immagine ufficiale di Playwright
FROM mcr.microsoft.com/playwright:v1.38.0

# Setta la working directory
WORKDIR /usr/src/app

# Copia i file package.json e package-lock.json
COPY package.json ./

# Installa le dipendenze
RUN npm install

# Installa i browser di Playwright
RUN npx playwright install

# Copia il resto dei file dell'app
COPY . .

# Espone la porta per il server Playwright
EXPOSE 3003

# Avvia il server Playwright
CMD ["node", "index.js"]
