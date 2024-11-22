# Step 1: Build the React app
FROM node:18 AS build

WORKDIR /app

# Copy package.json 
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React app
RUN npm run build

# Step 2: Serve the React app with nginx
FROM nginx:1.23

# Copy the custom nginx configuration file
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Copy the build output to the nginx HTML folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
