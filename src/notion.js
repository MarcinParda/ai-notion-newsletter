import { Client } from '@notionhq/client';
import { richTextToMarkdown, cleanString } from './utils.js';

function getNotionClient() {
  if (!process.env.NOTION_READER_DATABASE_ID) {
    throw new Error('Notion database id is not set');
  }
  return new Client({ auth: process.env.NOTION_NEWSLETTER_CONNECTION });
}

function filterByDate(arr, date) {
  return arr.filter((obj) => new Date(obj.readDate) > new Date(date));
}

function notionPageToArticle(page) {
  const titlePlainTexts = page.properties.Title.title.map(
    (text) => text.plain_text
  );
  const title = cleanString(titlePlainTexts.join(''));
  const comment = richTextToMarkdown(page.properties.my_comment);
  const my_comment = comment ? cleanString(comment) : null;
  const link = page.properties.link.url;
  const is_newsletter = page.properties.newsletter.checkbox;
  const readDate = new Date(page.properties.read_date?.date?.start);
  const isHighlighted = page.properties.highlight.checkbox;

  return {
    title,
    my_comment,
    link,
    is_newsletter,
    readDate,
    isHighlighted,
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

  const { lastNewsletterSentDate } = await getLastNewsletterData();
  const filterDate = new Date(lastNewsletterSentDate);
  const articlesSinceLastNewsletter = filterByDate(allArticles, filterDate);
  const newsletterArticles = articlesSinceLastNewsletter.filter(
    (article) => article.is_newsletter
  );
  const articles = newsletterArticles.map((article) => ({
    title: article.title,
    my_comment: article.my_comment,
    link: article.link,
    isHighlighted: article.isHighlighted,
  }));

  return articles;
}

export async function getLastNewsletterData() {
  const notion = getNotionClient();

  const pages = await notion.databases.query({
    database_id: process.env.NOTION_NEWSLETTER_DATABASE_ID,
  });

  const lastBlogNewsletter = pages.results[0];
  const lastNewsletterSentDate = lastBlogNewsletter.created_time;
  const lastNewsletterNumber =
    lastBlogNewsletter.properties.Name.title[0].plain_text.split('#')[1];

  return {
    lastNewsletterSentDate,
    lastNewsletterNumber,
  };
}

export async function saveNewslettersToNotion(jobNewsletter, blogNewsletter) {
  const notion = getNotionClient();

  const blogNewsletterParagraphs = blogNewsletter.split('\n');
  const jobNewsletterParagraphs = jobNewsletter.split('\n');

  const jobNewsletterTitle = jobNewsletterParagraphs[0];
  const regex = /"([^"]+)"/;
  const match = blogNewsletterParagraphs[1].match(regex);
  if (!match) {
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
