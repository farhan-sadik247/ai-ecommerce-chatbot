import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK with the API key from environment variables
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export default genAI;
