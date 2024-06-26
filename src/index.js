import { getArticles, saveNewslettersToNotion } from './notion.js';
import { addCategoriesToArticles } from './add_category.js';
import { generateNewsletters } from './generate_newsletters.js';
import { groupArticlesByCategory } from './utils.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('Getting articles from notion...');
const articles = await getArticles();
const highlightedArticles = articles.filter((article) => article.isHighlighted);

console.log('Assigning categories with GPT...');
const articlesWithCategories = await addCategoriesToArticles(articles);

console.log('Grouping articles by category...');
const groupedArticles = groupArticlesByCategory(articlesWithCategories);

console.log('Generating newsletters...');
const { jobNewsletter, blogNewsletter } = await generateNewsletters(
  groupedArticles,
  highlightedArticles
);

console.log('Saving newsletters to notion...');
await saveNewslettersToNotion(jobNewsletter, blogNewsletter);

console.log('\n---\n\nNEW NEWSLETTERS SAVED ON NOTION!\n');

process.exit(0);
