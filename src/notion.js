import { Client } from '@notionhq/client';

const filter = {
  and: [
    {
      property: 'newsletter',
      checkbox: {
        equals: true,
      },
    },
    {
      property: 'created_at',
      date: {
        on_or_after: '2024-01-31',
      },
    },
  ],
};

async function getAllArticles() {
  const notion = new Client({ auth: process.env.NOTION_NEWSLETTER_CONNECTION });
  if (!process.env.NOTION_READER_DATABASE_ID) {
    throw new Error('Notion database id is not set');
  }
  const articles = [];
  let next_cursor = undefined;
  let has_more = false;
  do {
    const pages = await notion.databases.query({
      database_id: process.env.NOTION_READER_DATABASE_ID,
      start_cursor: next_cursor,
    });
    const newArticles = pages.results.map((page) => {
      const my_comment = page.properties['my_comment'].rich_text[0]?.plain_text
        ? cleanString(page.properties['my_comment'].rich_text[0].plain_text)
        : null;
      return {
        title: cleanString(page.properties['Title'].title[0].plain_text),
        my_comment,
        link: page.properties['link'].url,
      };
    });
    articles.push(...newArticles);
    next_cursor = pages.next_cursor;
    has_more = pages.has_more;
  } while (has_more);

  return articles;
}

export async function getArticles() {
  const articles = await getAllArticles();
  return articles;
}

export function cleanString(str) {
  return str.replace(/\s+/g, ' ').trim();
}
