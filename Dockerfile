# stage development
FROM node:12.16-alpine As prod
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run prebuild && npm run build
CMD ["npm", "run", "start:dev"]


FROM node:12.16-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run prebuild && npm run build

# stage production
FROM node:12.16-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --prod

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]