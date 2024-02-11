const MY_HOST = 'parda.me';

export function richTextToMarkdown(block) {
  const { type } = block;
  if (type !== 'rich_text') {
    throw new Error('Triying to convert non rich text block to markdown');
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

export function cleanString(str) {
  return str.replace(/\s+/g, ' ').trim();
}
