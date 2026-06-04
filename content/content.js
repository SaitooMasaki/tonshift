// メイン注入スクリプト — 多重実行防止
if (typeof window.__tonshift_loaded__ === 'undefined') {
  window.__tonshift_loaded__ = true;

  const MIN_CHARS = 20;
  const DEBOUNCE_MS = 300;

  let uiPanel = null;
  let activeInputEl = null;
  let observedElements = new WeakSet();
  let hideTimer = null;

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  async function initUI() {
    const siteConfig = getCurrentSiteConfig();
    if (!siteConfig) return;

    uiPanel = ToneShiftUI.getInstance();
    await uiPanel.init();
  }

  function getTextLength(el) {
    return (el.innerText || el.value || el.textContent || '').trim().length;
  }

  const onInput = debounce((el) => {
    if (!uiPanel) return;
    const len = getTextLength(el);
    if (len >= MIN_CHARS) {
      uiPanel.showTrigger(el);
    } else {
      uiPanel.hideTrigger();
    }
  }, DEBOUNCE_MS);

  function onFocus(e) {
    const el = e.target;
    if (!uiPanel) return;
    activeInputEl = el;
    const len = getTextLength(el);
    if (len >= MIN_CHARS) {
      uiPanel.showTrigger(el);
    }
  }

  function onBlur(e) {
    // 短い遅延の後にパネルが開いていなければ非表示
    hideTimer = setTimeout(() => {
      if (!uiPanel) return;
      const focused = document.activeElement;
      // Shadow DOM内にフォーカスがあれば非表示にしない
      if (uiPanel.isPanelOpen) return;
      uiPanel.hideTrigger();
    }, 200);
  }

  function attachToInput(el) {
    if (observedElements.has(el)) return;
    observedElements.add(el);

    el.addEventListener('focus', onFocus);
    el.addEventListener('blur', onBlur);
    el.addEventListener('input', () => onInput(el));
    el.addEventListener('keyup', () => onInput(el));
  }

  function scanAndAttach() {
    const siteConfig = getCurrentSiteConfig();
    if (!siteConfig) return;

    // 既存の入力エリアにアタッチ
    for (const selector of siteConfig.inputSelectors) {
      document.querySelectorAll(selector).forEach(attachToInput);
    }
  }

  // MutationObserver でSPAの動的DOM変化に対応
  let mutationObserver = null;

  function startObserver() {
    if (mutationObserver) return;

    const observeDebounced = debounce(scanAndAttach, 500);

    mutationObserver = new MutationObserver((mutations) => {
      let hasRelevant = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          hasRelevant = true;
          break;
        }
      }
      if (hasRelevant) observeDebounced();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // メッセージハンドラ
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'OPEN_OPTIONS') {
      chrome.runtime.openOptionsPage();
    }
  });

  // 初期化
  async function bootstrap() {
    const siteConfig = getCurrentSiteConfig();
    if (!siteConfig) return;

    const [extensionEnabled, siteEnabled] = await Promise.all([
      ToneShiftStorage.getExtensionEnabled(),
      ToneShiftStorage.getSiteEnabled(window.location.hostname)
    ]);

    if (!extensionEnabled || !siteEnabled) return;

    await initUI();
    scanAndAttach();
    startObserver();
  }

  // DOMが準備できたら実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  // ページアンロード時にクリーンアップ
  window.addEventListener('unload', () => {
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
    if (uiPanel) {
      uiPanel.destroy();
      uiPanel = null;
    }
  });
}
