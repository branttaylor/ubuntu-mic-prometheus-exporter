FROM node:alpine3.19

RUN apk update && apk add --no-cache \
    git && \
    alsa-utils \
    sox \
    rm -rf /tmp/* /var/cache/apk/* \
    && mkdir /app

WORKDIR /app

RUN git clone https://github.com/branttaylor/ubuntu-mic-prometheus-exporter.git /app && \
    npm install

CMD npm start

EXPOSE 8000
