import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.OPEN_AI_API_KEY) {
  console.error(
    'Please add your OpenAI API key to your environment variables as OPEN_AI_API_KEY'
  );
  process.exit(1);
}

export const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});
