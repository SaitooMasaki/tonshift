// ToneShift Service Worker
// 課金: Lemon Squeezy License Key 方式（ExtensionPayは不使用）

// Pro状態をstorageに同期（ライセンスキーを再検証）
function syncProStatus() {
  chrome.storage.local.get(['licenseKey'], (result) => {
    if (!result.licenseKey) {
      chrome.storage.local.set({ isPro: false });
      return;
    }
    // バックグラウンドでは検証せずキャッシュを信頼する
    // 実際の検証はoptions pageで行う
  });
}

// インストール時・起動時に初期化
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['siteEnabled', 'defaultTone', 'extensionEnabled'], (result) => {
    const defaults = {};
    if (!result.siteEnabled) {
      defaults.siteEnabled = {
        'mail.google.com': true,
        'www.linkedin.com': true,
        'twitter.com': true,
        'x.com': true
      };
    }
    if (!result.defaultTone) defaults.defaultTone = 'Professional';
    if (result.extensionEnabled === undefined) defaults.extensionEnabled = true;
    if (Object.keys(defaults).length > 0) {
      chrome.storage.local.set(defaults);
    }
  });
});

chrome.runtime.onStartup.addListener(syncProStatus);

// content scriptの注入
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url) return;

  const supportedHosts = [
    'mail.google.com',
    'www.linkedin.com',
    'twitter.com',
    'x.com'
  ];

  let hostname = '';
  try {
    const url = new URL(tab.url);
    if (!supportedHosts.includes(url.hostname)) return;
    hostname = url.hostname;
  } catch {
    return;
  }

  chrome.storage.local.get(['extensionEnabled', 'siteEnabled'], (result) => {
    if (!result.extensionEnabled) return;
    const siteEnabled = result.siteEnabled || {};
    if (siteEnabled[hostname] === false) return;

    chrome.scripting.executeScript({
      target: { tabId },
      files: [
        'utils/storage.js',
        'utils/sites.js',
        'api/lemon-squeezy.js',
        'api/claude.js',
        'content/context.js',
        'content/ui.js',
        'content/content.js'
      ]
    }).catch(() => {
      // すでに注入済みの場合は無視
    });
  });
});

// メッセージハンドラ
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_PAYMENT') {
    // Lemon Squeezy のチェックアウトページを開く
    chrome.tabs.create({
      url: 'https://saitoomasaki.lemonsqueezy.com/checkout/buy/2f6974e6-42dc-4e21-905e-8769258a55b7'
    });
    sendResponse({ success: true });
  }
  if (message.type === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
  }
  if (message.type === 'SYNC_PRO') {
    syncProStatus();
    sendResponse({ success: true });
  }
});
