import { openai } from './openai.js';

export async function chatComplition({
  systemPrompt,
  userPrompt,
  model = 'gpt-3.5-turbo',
  max_tokens = 256,
}) {
  const messages = [];
  if (systemPrompt) messages.push({ content: systemPrompt, role: 'system' });
  if (userPrompt) messages.push({ content: userPrompt, role: 'user' });

  const response = await openai.chat.completions.create({
    messages,
    model,
    max_tokens,
  });

  return {
    conversationId: response.id,
    message: response.choices[0].message.content || '',
  };
}
