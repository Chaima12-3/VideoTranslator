FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY . .  

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]