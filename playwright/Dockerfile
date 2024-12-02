# Usa un'immagine Playwright con Node.js
FROM mcr.microsoft.com/playwright:v1.37.0

# Imposta la directory di lavoro
WORKDIR /usr/src/app

# Copia package.json e package-lock.json
COPY package.json ./


# Installa le dipendenze
RUN npm install

# Copia tutto il codice
COPY . .

# Espone la porta del server Express
EXPOSE 3003

# Comando per avviare il server
CMD ["npm", "start"]
