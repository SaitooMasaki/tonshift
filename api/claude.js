// Anthropic Claude API呼び出し
const ClaudeAPI = (() => {
  const MODEL = 'claude-haiku-4-5-20251001';
  const API_URL = 'https://api.anthropic.com/v1/messages';
  const MAX_TOKENS = 1024;

  async function callAPI(apiKey, systemPrompt, userPrompt) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      const error = { status: response.status };
      try {
        const body = await response.json();
        error.message = body.error?.message || 'Unknown error';
      } catch {
        error.message = 'Request failed';
      }
      throw error;
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async function rewriteText(apiKey, inputText, tone, context) {
    const systemPrompt =
      'You are a professional writing assistant. Rewrite the given text in the specified tone while preserving the original meaning. ' +
      'IMPORTANT: Always respond in the exact same language as the original text. If the original is in Japanese, respond in Japanese. If in English, respond in English. ' +
      'Return ONLY the rewritten text, no explanations.';

    const contextPart = context
      ? `Context (what this is responding to): ${context}\n\n`
      : '';

    const userPrompt =
      `Rewrite the following text in a ${tone} tone.\n\n` +
      contextPart +
      `Original text: ${inputText}`;

    return await callAPI(apiKey, systemPrompt, userPrompt);
  }

  async function generateReplies(apiKey, context, tone) {
    const systemPrompt =
      'You are a professional writing assistant. Generate 3 distinct reply options for the given message. Each reply should be complete and ready to send. ' +
      'IMPORTANT: Always respond in the exact same language as the message you are replying to. ' +
      'Return ONLY a JSON array with exactly 3 strings, no other text: ["reply1", "reply2", "reply3"]';

    const userPrompt =
      `Generate 3 ${tone} replies to this message:\n\n${context}`;

    const raw = await callAPI(apiKey, systemPrompt, userPrompt);

    // JSON配列をパース
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('Invalid response format');
    return JSON.parse(match[0]);
  }

  function formatError(error) {
    if (error.status === 429) {
      return 'Too many requests, please wait a moment.';
    }
    if (error.status === 401) {
      return 'Invalid API key. Please check your settings.';
    }
    if (error.status === 400) {
      return 'Bad request. Please try again with different text.';
    }
    if (error.name === 'TypeError' || !error.status) {
      return 'Network error. Please check your connection.';
    }
    return `Error: ${error.message || 'Something went wrong.'}`;
  }

  return { rewriteText, generateReplies, formatError };
})();
