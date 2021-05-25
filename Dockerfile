FROM node:12.16-alpine
WORKDIR /pettyCash
COPY . .
RUN yarn install
RUN yarn run build
CMD [ "node", "/pettyCash/dist/main.js" ]
