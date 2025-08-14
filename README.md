# Shoe Bay 247 — AI E‑Commerce Chatbot (Shoes)

Live: https://shoe-bay247.vercel.app/

## Overview

Shoe Bay 247 is a conversational e‑commerce web app for discovering and buying shoes. It combines a classic product browsing experience with an AI shopping assistant, secure auth, cart and checkout, and order tracking. Built with Next.js, MongoDB, TypeScript, and Groq (Llama 3.1).

## Features

- AI shopping assistant for search, recommendations.
- Shoe catalog with categories (sneakers, boots, sandals, loafers, flip‑flops, soccer shoes)
- Product details, image gallery, and inventory-aware add-to-cart
- Authentication (register/login), profile management
- Persistent cart, quantity updates, and removal
- Checkout with address confirmation and payment handoff (e.g., bKash)
- Orders list and order detail pages (success/failure status)
- Chat history saved per user
- Responsive UI with SCSS modules

## User Guide (Step by Step)

1) Open the app: https://shoe-bay247.vercel.app/

2) Create an account or sign in
- Use the Auth modal to register or log in.

3) Important: Update your profile address (required to place orders)
- Go to Profile (top-right menu or /profile).
- Add your full shipping address (street, city, postal code, phone) and Save.
- Orders cannot be placed until a valid profile address is saved.

4) Browse and search products
- Explore categories or use search to find shoes.
- Click a product to view details and images.

5) Add to Cart
- Choose quantity and add the product to your cart.
- Open the cart to review, update quantities, or remove items.

6) Checkout
- Click Checkout from the cart.
- Confirm your shipping details (pulled from your profile).
- Proceed to payment. On success you’ll be redirected to the success page; otherwise, the failed page explains next steps.

7) Track Orders
- Visit Orders to view your order history and details.

8) Use the AI Chatbot
- What it can do:
	- Find shoes by category, brand, color, or size.
	- Add items to your cart directly from chat (specify name/brand, color, size, and quantity).
	- Show your cart or remove specific items.
	- Start checkout from chat. In-chat orders are placed as Cash on Delivery. For online payment (e.g., bKash), proceed via the regular checkout page.

- Example prompts:
	- "Add Nike Air Max, black, size 9 to my cart"
	- "What's in my cart?"
	- "Remove the red sneakers size 8"
	- "I'm ready to checkout"

- Notes:
	- You must be logged in to use chat.
	- To place orders in chat, ensure your profile address is saved (see step 3).

## Tech Stack

- Next.js 15, React, TypeScript, SCSS
- API Routes (Node.js) + MongoDB (Mongoose)
- Auth with NextAuth
- AI via Groq (Llama 3.1 8B Instant)

## Demo Data & Images

- Shoe images are sourced from: https://www.kaggle.com/datasets/noobyogi0100/shoe-dataset

## Run Locally (optional)

Prereqs: Node 18+, MongoDB, Groq API key.

1) Install dependencies
```
npm install
```
2) Configure environment (.env.local)
```
MONGODB_URI=your_mongodb_uri
GROQ_API_KEY=your_groq_api_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
JWT_SECRET=your_jwt_secret
```
3) Start
```
npm run dev
```
Open http://localhost:3000
