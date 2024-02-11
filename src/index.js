import { getArticles } from './notion.js';
import { addCategoriesToArticles } from './add_category.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('Getting articles from notion...');
const articles = await getArticles();
console.log('Assigning categories with GPT...');
const articlesWithCategories = await addCategoriesToArticles(articles);

console.log(articlesWithCategories);
process.exit(0);
