FROM node:boron

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

#COPY . .

RUN git clone

EXPOSE 8081

CMD [ "nodejs", "app.js" ]