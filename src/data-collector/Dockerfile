#start with a nodejs base-image
FROM node:12.18.3-alpine

WORKDIR /usr/src/app

#install required nodejs packages
RUN npm install influx
RUN npm install mqtt

#copy the nodejs script into the container
COPY . .

#set start command for container
CMD [ "node", "app.js" ]
