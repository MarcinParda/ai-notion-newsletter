import { getArticles } from './notion.js';
import dotenv from 'dotenv';
dotenv.config();

const articles = await getArticles();
