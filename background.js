// ExtPay.js が存在しない場合でも Service Worker が死なないようにする
let extpay = null;
try {
  importScripts('ExtPay.js');
  extpay = ExtPay('tonshift');
  extpay.startBackground();
} catch (e) {
  console.warn('[ToneShift] ExtPay failed to load:', e.message);
}

// Pro状態をstorageに同期
function syncProStatus() {
  if (!extpay) return;
  extpay.getUser().then(user => {
    chrome.storage.local.set({ isPro: user.paid });
  }).catch(() => {
    // ネットワークエラー時は既存のキャッシュを使用
  });
}

// インストール時・起動時に同期
chrome.runtime.onInstalled.addListener(() => {
  syncProStatus();
  // デフォルト設定を初期化
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

  let isSupported = false;
  try {
    const url = new URL(tab.url);
    isSupported = supportedHosts.some(host => url.hostname === host);
  } catch {
    return;
  }

  if (!isSupported) return;

  chrome.storage.local.get(['extensionEnabled', 'siteEnabled'], (result) => {
    if (!result.extensionEnabled) return;

    let hostname = '';
    try {
      hostname = new URL(tab.url).hostname;
    } catch {
      return;
    }

    const siteEnabled = result.siteEnabled || {};
    if (siteEnabled[hostname] === false) return;

    chrome.scripting.executeScript({
      target: { tabId },
      files: [
        'utils/storage.js',
        'utils/sites.js',
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
    if (extpay) extpay.openPaymentPage();
    sendResponse({ success: true });
  }
  if (message.type === 'GET_PRO_STATUS') {
    if (!extpay) {
      chrome.storage.local.get(['isPro'], (result) => {
        sendResponse({ isPro: result.isPro || false });
      });
      return true;
    }
    extpay.getUser().then(user => {
      chrome.storage.local.set({ isPro: user.paid });
      sendResponse({ isPro: user.paid });
    }).catch(() => {
      chrome.storage.local.get(['isPro'], (result) => {
        sendResponse({ isPro: result.isPro || false });
      });
    });
    return true; // 非同期レスポンスのためtrueを返す
  }
  if (message.type === 'SYNC_PRO') {
    syncProStatus();
    sendResponse({ success: true });
  }
  if (message.type === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
  }
});
