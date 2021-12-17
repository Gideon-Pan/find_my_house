# Specify a base image
FROM node:alpine

WORKDIR /usr/app

# Install npm depenendencies
COPY ./package.json ./
RUN npm install
RUN npm install -g pm2
# Copy all files from local to the running docker container
COPY ./ ./
# Copy configuration
COPY ./.env.docker /usr/app/.env 

# Default command
CMD ["pm2-runtime", "start", "app.js", "--node-args='--max-old-space-size=4096'"]