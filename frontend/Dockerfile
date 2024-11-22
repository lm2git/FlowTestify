# Step 1: Build the React app
FROM node:18 AS build

# Set the working directory in the container
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

# Copy the build output to the nginx HTML folder
COPY --from=build /app/build /usr/share/nginx/html

# Copy a custom nginx configuration file if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
