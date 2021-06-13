FROM node:12.16-alpine AS development
WORKDIR /pettyCash
COPY . .
RUN yarn install
RUN yarn run build

FROM node:12.16-alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /pettyCash
COPY . .
RUN yarn install --prod
COPY --from=development /pettyCash/dist ./dist
CMD [ "node", "/pettyCash/dist/main.js" ]
