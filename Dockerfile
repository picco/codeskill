FROM node:8-stretch

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
  apt-utils \
  && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y \
  git \
  php-cli \
  && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/meelis82/codeskill.git /usr/src/app

RUN npm install

EXPOSE 8081

CMD [ "nodejs", "app.js" ]