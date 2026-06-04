// ページコンテキスト読み取り
const ToneShiftContext = (() => {
  function safeText(el, maxLength) {
    try {
      if (!el) return '';
      const text = el.innerText || el.textContent || '';
      return text.trim().slice(0, maxLength);
    } catch {
      return '';
    }
  }

  function getPageContext() {
    const hostname = window.location.hostname;
    const config = (typeof SUPPORTED_SITES !== 'undefined' && SUPPORTED_SITES[hostname]) || null;
    if (!config) return '';

    try {
      const el = findContextElement(config);
      return safeText(el, config.maxContextLength);
    } catch {
      return '';
    }
  }

  function getInputText(inputEl) {
    if (!inputEl) return '';
    try {
      return (inputEl.innerText || inputEl.value || inputEl.textContent || '').trim();
    } catch {
      return '';
    }
  }

  function setInputText(inputEl, text) {
    if (!inputEl) return;
    try {
      // contenteditable対応
      if (inputEl.isContentEditable || inputEl.getAttribute('contenteditable') === 'true') {
        inputEl.focus();
        // 選択してから置換（React/Vue管理のDOMに対応）
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(inputEl);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('insertText', false, text);
        // execCommandが無効な環境のフォールバック
        if (inputEl.innerText !== text) {
          inputEl.innerText = text;
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } else {
        // 通常のinput/textarea
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype, 'value'
        ) || Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');

        if (nativeInputValueSetter && nativeInputValueSetter.set) {
          nativeInputValueSetter.set.call(inputEl, text);
        } else {
          inputEl.value = text;
        }
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        inputEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch {
      // フォールバック
      try {
        inputEl.innerText = text;
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      } catch {
        // 何もしない
      }
    }
  }

  return { getPageContext, getInputText, setInputText };
})();
