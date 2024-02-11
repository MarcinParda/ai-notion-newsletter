import { chatComplition } from './chat_complition.js';

export const categories = [
  'HTML',
  'CSS',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'React',
  'Angular',
  'Next.js',
  'Remix',
  'HTMX',
  'Testing',
  'Architecture',
  'Self-development',
  'Releases',
  'Other',
];

const systemPrompt = `You are a article categorizer.
  In USER PROMPT you have a LIST in JSON format and your job is to each 
  ELEMENT of the LIST add a new property called "category".
  
  Example input:

  [{
    "title": "HTML5 Tags",
    "my_comment": "Comment of the article about HTML",
    "link": "https://article-url.org",
  },
  {
    "title": "Microservices in TypeScript",
    "my_comment": "Comment of the podcast about JavaScript",
    "link": "https://podcast-url.org"
  }]

  Expected response:

  [{
    "title": "HTML5 Tags",
    "my_comment": "Comment of the article about HTML",
    "link": "https://article-url.org",
    "category": "HTML"
  },
  {
    "title": "Microservices in TypeScript",
    "my_comment": "Comment of the podcast about JavaScript",
    "link": "https://podcast-url.org",
    "category": "TypeScript"
  }]

  List of categories:
  [${categories.join(', ')}]

  Strict rules you're obligated to follow throughout the conversation:
  - Releases category is for articles about new releases
  - if the ELEMENT fits in multiple categories, add category that is lower on the list
  - if the ELEMENT absolutely doesn't fit in any of the categories, add category "Other"
  `;

export async function addCategoriesToArticles(articles) {
  const userPrompt = `
  ---USER PROMPT---
  ${JSON.stringify(articles, null, 2)}
  ---END USER PROMPT---`;

  const response = await chatComplition({
    systemPrompt,
    userPrompt,
    max_tokens: 4096,
    model: 'gpt-3.5-turbo-16k',
  });

  return JSON.parse(response.message);
}
