import { getArticles, saveNewslettersToNotion } from './notion.js';
import { addCategoriesToArticles } from './add_category.js';
import { generateNewsletters } from './generate_newsletters.js';
import { groupArticlesByCategory } from './utils.js';
import dotenv from 'dotenv';
import { updateLastNewsletterDate, updateLastNewsletterNumber } from './updateGithubSecret.js';
dotenv.config();

console.log('Getting articles from notion...');
const articles = await getArticles();

console.log('Assigning categories with GPT...');
const articlesWithCategories = await addCategoriesToArticles(articles);

console.log('Grouping articles by category...');
const groupedArticles = groupArticlesByCategory(articlesWithCategories);

console.log('Generating newsletters...');
const { jobNewsletter, blogNewsletter } = generateNewsletters(groupedArticles);

console.log('Saving newsletters to notion...');
await saveNewslettersToNotion(jobNewsletter, blogNewsletter);

console.log('\n---\n\nNEW NEWSLETTERS SAVED ON NOTION!\n');

await updateLastNewsletterDate();
await updateLastNewsletterNumber();
console.log('\n---\n\nGITHUB SECRETS UPDATED!\n');

process.exit(0);
