# Specify a base image
FROM node:alpine

WORKDIR /usr/app

# Install some depenendencies
COPY ./package.json /usr/app
RUN npm install
RUN npm install -g pm2
COPY ./ ./
# config
COPY ./.env.docker /usr/app/.env 

# Default command
# CMD ["ls", "/usr/app"]
CMD ["pm2-runtime", "start", "app.js", "--node-args='--max-old-space-size=4096'"]