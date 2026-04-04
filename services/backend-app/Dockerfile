# services/backend-app/Dockerfile

FROM node:18-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# The command is now simple again, as the DB will be ready before this starts.
CMD [ "npm", "run", "start" ]