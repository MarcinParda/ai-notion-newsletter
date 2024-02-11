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

export async function getArticles() {
  const notion = new Client({ auth: process.env.NOTION_NEWSLETTER_CONNECTION });
  if (!process.env.NOTION_READER_DATABASE_ID) {
    throw new Error('Notion database id is not set');
  }
  const pages = await notion.databases.query({
    database_id: process.env.NOTION_READER_DATABASE_ID,
    filter,
  });
  const articles = pages.results.map((page) => {
    const my_comment = page.properties['my_comment'].rich_text[0]?.plain_text
      ? cleanString(page.properties['my_comment'].rich_text[0].plain_text)
      : null;
    return {
      title: cleanString(page.properties['Title'].title[0].plain_text),
      my_comment,
      link: page.properties['link'].url,
    };
  });
  console.log(JSON.stringify(articles));
  return articles;
}

export function cleanString(str) {
  return str.replace(/\s+/g, ' ').trim();
}
