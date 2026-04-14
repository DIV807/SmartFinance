FROM node:20-slim

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY src ./src
COPY credentials.json ./credentials.json

ENV GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json

# Ensure a writable uploads directory exists (multer will also create it if missing)
RUN mkdir -p uploads

EXPOSE 5001

CMD ["npm", "start"]
