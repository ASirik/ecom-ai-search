# E-commerce Catalog + AI Smart Search (Option A)

A small e-commerce application with a product catalog and AI-powered natural language search.

## Overview
- Static product catalog (`products.json`, 20 products)
- **AI Smart Search (NLP)**: free-text query → structured filters (`category`, `maxPrice`, `minRating`, `keywords`) → catalog filtering
- Backend: Express (Node.js)
- Frontend: React

# Example inputs
# show me mens clothes under 50$
# show me jewelery with good rating
# show me all
---

## How to Run

### 1) Requirements
- Node.js 18+ (LTS recommended)
- npm or yarn

### 2) Environment Variables
Create `api/.env`:

OPENAI_API_KEY=<your_openai_key>
OPENAI_MODEL=gpt-3.5-turbo
PORT=4001
CORS_ORIGIN=http://localhost:3000


### 3) Install & Start

```bash
# Backend
cd api
npm install
npm start      # or nodemon server.js

# Frontend (in another terminal)
cd ..
npm install
npm run client # or npm start, depending on scripts
