import { Client } from '@notionhq/client';

function getNotionClient() {
  if (!process.env.NOTION_READER_DATABASE_ID) {
    throw new Error('Notion database id is not set');
  }
  return new Client({ auth: process.env.NOTION_NEWSLETTER_CONNECTION });
}

const MY_HOST = 'parda.me';

export function richTextToMarkdown(block) {
  const { type } = block;
  if (type !== 'rich_text') {
    console.error(
      new Error('Triying to convert non rich text block to markdown')
    );
    return null;
  }

  return block.rich_text.reduce((acc, curr) => {
    const { plain_text: text, annotations, href } = curr;
    const { bold, code, italic, strikethrough } = annotations;
    const url = href && new URL(href);
    let path = href;

    if (url?.hostname === MY_HOST) {
      path = url.pathname;
    }

    let parsed = text;

    if (italic) {
      parsed = `_${parsed}_`;
    }
    if (bold) {
      parsed = `**${parsed}**`;
    }
    if (code) {
      parsed = `\`${parsed}\``;
    }
    if (strikethrough) {
      parsed = `~~${parsed}~~`;
    }
    if (path) {
      parsed = `[${parsed}](${path})`;
    }

    return `${acc}${parsed}`;
  }, '');
}

function notionPageToArticle(page) {
  console.log(page.properties.Title);
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

function filterByDate(arr) {
  return arr.filter((obj) => new Date(obj.date) > new Date('2024-01-29'));
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
  console.log(newsletterArticles, newsletterArticles.length);
  return newsletterArticles;
}

export function cleanString(str) {
  return str.replace(/\s+/g, ' ').trim();
}
