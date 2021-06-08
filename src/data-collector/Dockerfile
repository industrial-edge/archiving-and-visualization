# start with a nodejs base-image
FROM node:12.18.3-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install --production

# Bundle app source
COPY . .

#set start command for container
CMD [ "node", "app.js" ]
