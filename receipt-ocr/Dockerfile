FROM node:18-slim

# Install Tesseract
RUN apt-get update && \
    apt-get install -y tesseract-ocr && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .
RUN npm install

COPY src ./src

EXPOSE 5001
CMD ["npm", "start"]
