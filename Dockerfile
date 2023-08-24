FROM node:18-alpine3.15

WORKDIR /home/simple-nvr
COPY ./package.json .

RUN apk add ffmpeg
RUN npm install pm2 -g
RUN npm install

COPY . .

CMD [ "pm2-runtime", "start", "pm2.json" ]