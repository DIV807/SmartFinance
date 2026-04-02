FROM node:20-slim

# Install Tesseract OCR engine
RUN apt-get update && \
    apt-get install -y tesseract-ocr && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY src ./src

# Ensure a writable uploads directory exists (multer will also create it if missing)
RUN mkdir -p uploads

EXPOSE 5001

CMD ["npm", "start"]
