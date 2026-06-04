// サイト別設定
const SUPPORTED_SITES = {
  'mail.google.com': {
    name: 'Gmail',
    inputSelectors: [
      '.Am.Al.editable',
      '[role="textbox"][g_editable="true"]',
      '.editable.LW-avf'
    ],
    contextSelectors: [
      '.adn .a3s',
      '.ii.gt .a3s',
      '.gs .ii.gt'
    ],
    maxContextLength: 500
  },
  'www.linkedin.com': {
    name: 'LinkedIn',
    inputSelectors: [
      '.ql-editor',
      '[data-placeholder]',
      '.comments-comment-box__form .ql-editor'
    ],
    contextSelectors: [
      '.feed-shared-update-v2__description',
      '.update-components-text',
      '.feed-shared-text'
    ],
    maxContextLength: 300
  },
  'twitter.com': {
    name: 'Twitter/X',
    inputSelectors: [
      '[data-testid="tweetTextarea_0"]',
      '[data-testid="tweetTextarea_0root"] [contenteditable="true"]',
      '.public-DraftEditor-content'
    ],
    contextSelectors: [
      '[data-testid="tweet"] [lang]',
      '.r-1s2bzr4',
      '[data-testid="tweetText"]'
    ],
    maxContextLength: 280
  },
  'x.com': {
    name: 'X',
    inputSelectors: [
      '[data-testid="tweetTextarea_0"]',
      '[data-testid="tweetTextarea_0root"] [contenteditable="true"]',
      '.public-DraftEditor-content'
    ],
    contextSelectors: [
      '[data-testid="tweet"] [lang]',
      '[data-testid="tweetText"]'
    ],
    maxContextLength: 280
  }
};

function getCurrentSiteConfig() {
  const hostname = window.location.hostname;
  return SUPPORTED_SITES[hostname] || null;
}

function findInputElement(config) {
  if (!config) return null;
  for (const selector of config.inputSelectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
}

function findContextElement(config) {
  if (!config) return null;
  for (const selector of config.contextSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent.trim()) return el;
  }
  return null;
}
