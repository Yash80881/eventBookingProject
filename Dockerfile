# Build the React client
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Build the server and copy client build into server/public
FROM node:18-alpine
WORKDIR /app
# install server deps
COPY server/package*.json ./
RUN npm install --production
# copy server source
COPY server/ ./
# copy client build into server public folder
COPY --from=client-builder /app/client/dist ./public

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "index.js"]
