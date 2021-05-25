FROM node:12.16-alpine AS development
WORKDIR /pettyCash
COPY . .
RUN yarn install

FROM node:12.16-alpine AS production
WORKDIR /pettyCash
COPY . .
RUN yarn install
RUN yarn run build
CMD [ "node", "/pettyCash/dist/main.js" ]
