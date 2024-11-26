# Usa una versione stabile di node
FROM node:16

# Imposta la directory di lavoro
WORKDIR /app

# Copia package.json e package-lock.json prima per ottimizzare la cache
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto del codice sorgente
COPY . .

# Espone la porta 3000
EXPOSE 3000

# Comando per avviare il server React
CMD ["npm", "start"]