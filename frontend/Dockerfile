# Step 1: Build the React app
FROM node:18 AS build

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy all other files and build the app
COPY . ./
RUN npm run build

# Step 2: Serve the React app with nginx
FROM nginx:1.23

# Copy the build output to Nginx's html folder
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
