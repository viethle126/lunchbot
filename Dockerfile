FROM node:6.9.4

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install botkit --save
COPY lunchbot.js /usr/src/app/
COPY package.json /usr/src/app/
COPY lib /usr/src/app/

RUN npm install

CMD ["node", "lunchbot.js"]
