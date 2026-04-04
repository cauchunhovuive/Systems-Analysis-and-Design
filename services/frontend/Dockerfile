# services/frontend/Dockerfile

FROM node:20-alpine
WORKDIR /usr/src/ui

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# The command is now simple again, as the DB will be ready before this starts.
CMD [ "npm", "run", "dev" ]