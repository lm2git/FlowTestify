# Step 1: Build the React app
FROM node:18 AS build

WORKDIR /app

# Copia il package.json e package-lock.json
COPY ./frontend/package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutti i file dell'app frontend
COPY ./frontend/ ./

# Esegui la build dell'app React
RUN npm run build

# Usa l'immagine di Nginx per servire i file statici
FROM nginx:alpine

# Copia i file di build da Node.js a Nginx
COPY --from=build /app/build/ /usr/share/nginx/html/

# Copia la configurazione personalizzata di Nginx (se ne hai una)
# COPY nginx.conf /etc/nginx/nginx.conf

# Esponi la porta 80
EXPOSE 80

# Avvia Nginx
CMD ["nginx", "-g", "daemon off;"]
