import { categories } from './add_category.js';

function generateNewsletterBody(articles) {
  let newsletterBody = '';
  for (const category of categories) {
    if (!articles[category]) {
      continue;
    }
    if (articles[category].length === 0) {
      continue;
    }
    newsletterBody += `## ${category}\n`;
    articles[category].forEach((article) => {
      newsletterBody += `- [${article.title}](${article.link})`;
      if (article.my_comment) {
        newsletterBody += `  - ${article.my_comment}`;
      }
      newsletterBody += '\n';
    });
  }
  return newsletterBody;
}

export async function generateNewsletters(articles) {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const newsletterDate = `${year}-${month < 10 ? `0${month}` : month}-${
    day < 10 ? `0${day}` : day
  }`;
  const dayNameInEnglish = date.toLocaleDateString('en-US', {
    weekday: 'long',
  });
  const monthNameInEnglish = date.toLocaleDateString('en-US', {
    month: 'long',
  });

  // const newsletterNr = await countFilesInDirectory('newsletters/blog');

  const newsletterBody = generateNewsletterBody(articles);

  let blogNewsletter = `---
title: "Articles I read on my way to work - #4"
pubDate: ${newsletterDate}
tags: ["Newsletter"]
---

`;
  let jobNewsletter = `Wise ${dayNameInEnglish}, ${day} of ${monthNameInEnglish}, ${year}
`;

  blogNewsletter += newsletterBody;
  jobNewsletter += newsletterBody;

  return { jobNewsletter, blogNewsletter };
}
