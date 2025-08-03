# AI E-Commerce Chatbot

A conversational e-commerce web application for purchasing shoes, built with Next.js, MongoDB, and OpenAI integration.

## Features

- 🤖 AI-powered chatbot for natural language shopping
- 👟 Shoe product catalog with filtering and search
- 🛒 Shopping cart functionality
- 👤 User authentication and registration
- 💬 Chat history and intent recognition
- 📱 Responsive design with SCSS styling
- 🔒 Secure checkout process

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, SCSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **AI**: Groq API (Llama 3.1 8B Instant)
- **Authentication**: NextAuth.js
- **Styling**: SCSS (Sass)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-ecommerce-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add:
```env
MONGODB_URI=mongodb://localhost:27017/ai-ecommerce-chatbot
GROQ_API_KEY=your_groq_api_key_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                # Utility libraries (MongoDB, OpenAI)
├── models/             # Database models
├── styles/             # SCSS stylesheets
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Development Progress

- [x] Project setup and configuration
- [ ] Database schemas and models
- [ ] User authentication system
- [ ] Product catalog
- [ ] Shopping cart functionality
- [ ] OpenAI integration
- [ ] Chat interface
- [ ] Checkout flow
- [ ] UI/UX design
- [ ] Testing and deployment
