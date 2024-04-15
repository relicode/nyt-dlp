FROM node:iron-alpine

WORKDIR /home/node

COPY *.js *.json .

RUN chown -R node:node . && \
  apk add -U py3-pip ffmpeg && \
  apk add detox --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing/ && \
  su node -c 'npm i' && \
  npm i -g && \
  pip install --break-system-packages yt-dlp

ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["npm", "start"]

