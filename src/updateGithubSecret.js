const fetch = require('node-fetch');
dotenv.config();

if (!process.env.GITHUB_TOKEN) {
  console.error(
    'Please add your OpenAI API key to your environment variables as GITHUB_TOKEN'
  );
  process.exit(1);
}

if (!process.env.LAST_NEWSLETTER_DATE) {
  console.error(
    'Please add your OpenAI API key to your environment variables as LAST_NEWSLETTER_DATE'
  );
  process.exit(1);
}

if (!process.env.LAST_NEWSLETTER_NUMBER) {
  console.error(
    'Please add your OpenAI API key to your environment variables as LAST_NEWSLETTER_NUMBER'
  );
  process.exit(1);
}

const updateGithubSecret = async (secretName, newSecretValue) => {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = 'MarcinParda';
  const repoName = 'ai-notion-newsletter';

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/actions/secrets/${secretName}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${githubToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      encrypted_value: Buffer.from(newSecretValue).toString('base64'),
    }),
  });

  if (response.ok) {
    console.log(`Secret ${secretName} updated successfully`);
  } else {
    const data = await response.json();
    console.error('Failed to update secret:', data);
  }
};

export const updateLastNewsletterDate = async () => {
  const secretName = 'LAST_NEWSLETTER_DATE';
  const newLastNewsletterDate = new Date().split('T')[0];
  console.log('newLastNewsletterDate', newLastNewsletterDate);
  await updateGithubSecret(secretName, newLastNewsletterDate);
};

export const updateLastNewsletterNumber = async () => {
  const secretName = 'LAST_NEWSLETTER_NUMBER';
  const newLastNewsletterNumber =
    Number(process.env.LAST_NEWSLETTER_NUMBER) + 1;
  console.log('newLastNewsletterNumber', newLastNewsletterNumber);
  await updateGithubSecret(secretName, newLastNewsletterNumber);
};
