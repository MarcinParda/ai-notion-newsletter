import { Client } from '@notionhq/client';
import { richTextToMarkdown, cleanString } from './utils.js';

function getNotionClient() {
  if (!process.env.NOTION_READER_DATABASE_ID) {
    throw new Error('Notion database id is not set');
  }
  return new Client({ auth: process.env.NOTION_NEWSLETTER_CONNECTION });
}

function filterByDate(arr) {
  return arr.filter((obj) => new Date(obj.date) > new Date('2024-01-29'));
}

function notionPageToArticle(page) {
  const titlePlainTexts = page.properties.Title.title.map(
    (text) => text.plain_text
  );
  const title = cleanString(titlePlainTexts.join(''));
  const comment = richTextToMarkdown(page.properties.my_comment);
  const my_comment = comment ? cleanString(comment) : null;
  const link = page.properties.link.url;
  const date = new Date(page.properties.created_at.created_time);
  const is_newsletter = page.properties.newsletter.checkbox;

  return {
    title,
    my_comment,
    link,
    date,
    is_newsletter,
  };
}

async function getAllArticlesFromNotion() {
  const notion = getNotionClient();

  const articles = [];
  let next_cursor = undefined;
  let has_more = false;

  do {
    const pages = await notion.databases.query({
      database_id: process.env.NOTION_READER_DATABASE_ID,
      start_cursor: next_cursor,
    });
    const newArticles = pages.results.map((page) => notionPageToArticle(page));
    articles.push(...newArticles);
    next_cursor = pages.next_cursor;
    has_more = pages.has_more;
  } while (has_more);

  return articles;
}

export async function getArticles() {
  const allArticles = await getAllArticlesFromNotion();
  const articlesSinceLastNewsletter = filterByDate(allArticles);
  const newsletterArticles = articlesSinceLastNewsletter.filter(
    (article) => article.is_newsletter
  );
  const articles = newsletterArticles.map((article) => ({
    title: article.title,
    comment: article.my_comment,
    link: article.link,
  }));

  return articles;
}

const titleRegex = /"([^"]+)"/;

export async function saveNewslettersToNotion(jobNewsletter, blogNewsletter) {
  const notion = getNotionClient();

  const blogNewsletterParagraphs = blogNewsletter.split('\n');
  const jobNewsletterParagraphs = jobNewsletter.split('\n');

  const jobNewsletterTitle = jobNewsletterParagraphs[0];
  const regex = /"([^"]+)"/;
  const match = blogNewsletterParagraphs[1].match(regex);
  if(!match) {
    throw new Error('Blog newsletter title not found');
  }
  const blogNewsletterTitle = match[1];

  await notion.pages.create({
    parent: {
      type: 'database_id',
      database_id: process.env.NOTION_NEWSLETTER_DATABASE_ID,
    },
    properties: {
      Name: {
        title: [
          {
            type: 'text',
            text: {
              content: jobNewsletterTitle,
            },
          },
        ],
      },
    },
    children: [
      {
        object: 'block',
        paragraph: {
          rich_text: jobNewsletterParagraphs.map((paragraph) => ({
            text: {
              content: paragraph + '\n',
            },
          })),
          color: 'default',
        },
      },
    ],
  });

  console.log('Job newsletter saved to Notion');

  await notion.pages.create({
    parent: {
      type: 'database_id',
      database_id: process.env.NOTION_NEWSLETTER_DATABASE_ID,
    },
    properties: {
      Name: {
        title: [
          {
            type: 'text',
            text: {
              content: blogNewsletterTitle,
            },
          },
        ],
      },
    },
    children: [
      {
        object: 'block',
        paragraph: {
          rich_text: blogNewsletterParagraphs.map((paragraph) => ({
            text: {
              content: paragraph + '\n',
            },
          })),
          color: 'default',
        },
      },
    ],
  });

  console.log('Blog newsletter saved to Notion');
}
