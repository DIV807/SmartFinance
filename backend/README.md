SmartFinance Backend (Node + Express + MongoDB + Mongoose)

Quick start

1. Set up MongoDB
   - Get a free MongoDB Atlas URI: https://www.mongodb.com/cloud/atlas
   - Or use local MongoDB: mongodb://localhost:27017/smartfinance

2. Create .env file
   - Create a file named `.env` in this folder with:
     - MONGO_URI="your-mongodb-atlas-uri-here"
     - JWT_SECRET="replace-with-a-strong-secret"
     - PORT=5000

3. Install dependencies
   - npm install

4. Run the server
   - npm run dev
   - Server will start on http://localhost:5000

API Routes

- POST /auth/signup - Register new user
- POST /auth/login - Login user
- GET  /auth/me - Get current user (requires auth)
- POST /expenses - Create expense (requires auth)
- GET  /expenses - List user expenses (requires auth)
- DELETE /expenses/:id - Delete expense (requires auth)
- POST /groups - Create group (requires auth)
- POST /groups/:id/expenses - Add shared expense (requires auth)
- GET  /groups/:id/balances - Get group balances (requires auth)

Tech Stack

- Node.js + Express
- MongoDB (Mongoose ORM)
- JWT Authentication
- TypeScript



