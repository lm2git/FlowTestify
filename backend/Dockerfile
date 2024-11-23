# Base Image
FROM node:16

# Set Working Directory
WORKDIR /app

# Copy Files
COPY package.json  ./
RUN npm install

COPY . .

# Expose Port and Start Server
EXPOSE 3002
CMD ["npm", "start"]