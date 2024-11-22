# Step 1: Build the React app
FROM node:18 AS build

# Imposta la directory di lavoro
WORKDIR /app

# Copia il package.json e installa le dipendenze
COPY package.json package-lock.json ./
RUN npm install

# Copia il resto dei file del progetto
COPY . ./

# Crea il build di produzione
RUN npm run build

# Step 2: Serve la React app tramite Nginx
FROM nginx:1.23

# Copia il build generato da React nella directory di Nginx
COPY --from=build /app/build /usr/share/nginx/html/ui

# Copia il file di configurazione di Nginx personalizzato
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Espone la porta 80
EXPOSE 80

# Avvia Nginx
CMD ["nginx", "-g", "daemon off;"]
