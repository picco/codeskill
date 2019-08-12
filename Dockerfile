FROM node:8-stretch

WORKDIR /srv

RUN apt-get update && apt-get install -y \
  apt-utils \
  && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y \
  git \
  php-cli \
  && rm -rf /var/lib/apt/lists/*

COPY . .
RUN npm install
EXPOSE 8080
CMD [ "node", "app.js" ]
