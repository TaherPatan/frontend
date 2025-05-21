# Use an official Node.js runtime as a parent image
FROM node:20-alpine as builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Angular application
RUN npm run build

# Use a lightweight web server image to serve the built application
FROM nginx:alpine

# Copy the built application from the builder stage
COPY --from=builder /app/dist/document-app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Set the working directory to the Nginx html directory
WORKDIR /usr/share/nginx/html

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]