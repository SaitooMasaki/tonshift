// Shadow DOM ベースのフローティングUI
const ToneShiftUI = (() => {
  const TONES = ['Professional', 'Casual', 'Friendly', 'Assertive', 'Concise'];
  const FREE_DAILY_LIMIT = 10;

  const CSS = `
    :host {
      all: initial;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #1A1A2E;
    }

    * {
      box-sizing: border-box;
    }

    .ts-trigger {
      position: fixed;
      z-index: 2147483647;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #6C47FF;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 12px rgba(108, 71, 255, 0.4);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      padding: 0;
      color: white;
      font-size: 16px;
      line-height: 1;
    }

    .ts-trigger:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 16px rgba(108, 71, 255, 0.5);
    }

    .ts-trigger:active {
      transform: scale(0.95);
    }

    .ts-panel {
      position: fixed;
      z-index: 2147483647;
      width: 320px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transform: translateY(8px);
      opacity: 0;
      transition: transform 0.2s ease, opacity 0.2s ease;
      pointer-events: none;
    }

    .ts-panel.ts-open {
      transform: translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    .ts-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #6C47FF;
      color: white;
    }

    .ts-header-title {
      font-weight: 600;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ts-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 2px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.8;
      transition: opacity 0.15s;
      font-size: 16px;
      line-height: 1;
    }

    .ts-close:hover { opacity: 1; }

    .ts-body {
      padding: 14px 16px;
    }

    .ts-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #666;
      margin-bottom: 6px;
    }

    .ts-select {
      width: 100%;
      padding: 8px 10px;
      border: 1.5px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
      font-size: 13px;
      color: #1A1A2E;
      cursor: pointer;
      outline: none;
      transition: border-color 0.15s;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      padding-right: 28px;
    }

    .ts-select:focus {
      border-color: #6C47FF;
    }

    .ts-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
    }

    .ts-btn {
      width: 100%;
      padding: 9px 14px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.15s, opacity 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .ts-btn-primary {
      background: #6C47FF;
      color: white;
    }

    .ts-btn-primary:hover { background: #5835e8; }
    .ts-btn-primary:active { background: #4a2bd0; }
    .ts-btn-primary:disabled {
      background: #c4b5ff;
      cursor: not-allowed;
    }

    .ts-btn-secondary {
      background: #f0edff;
      color: #6C47FF;
    }

    .ts-btn-secondary:hover { background: #e2dcff; }

    .ts-btn-locked {
      background: #f5f5f5;
      color: #999;
      cursor: default;
    }

    .ts-upgrade-note {
      font-size: 11px;
      color: #999;
      text-align: center;
      margin-top: 4px;
    }

    .ts-upgrade-link {
      color: #6C47FF;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
    }

    .ts-upgrade-link:hover { text-decoration: underline; }

    .ts-results {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 260px;
      overflow-y: auto;
    }

    .ts-result-card {
      background: #f8f7ff;
      border: 1.5px solid #e8e4ff;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 13px;
      color: #1A1A2E;
      line-height: 1.5;
    }

    .ts-result-card p {
      margin: 0 0 8px 0;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .ts-use-btn {
      width: 100%;
      padding: 6px 10px;
      background: #6C47FF;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: background 0.15s;
    }

    .ts-use-btn:hover { background: #5835e8; }

    .ts-loading {
      text-align: center;
      padding: 16px;
      color: #6C47FF;
      font-size: 13px;
    }

    .ts-spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid #e0e0e0;
      border-top-color: #6C47FF;
      border-radius: 50%;
      animation: ts-spin 0.7s linear infinite;
      margin-right: 8px;
      vertical-align: middle;
    }

    @keyframes ts-spin {
      to { transform: rotate(360deg); }
    }

    .ts-error {
      background: #fff3f3;
      border: 1.5px solid #ffc0c0;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 12px;
      color: #c00;
      margin-top: 8px;
      display: flex;
      align-items: flex-start;
      gap: 6px;
    }

    .ts-error-retry {
      background: none;
      border: none;
      color: #6C47FF;
      font-size: 12px;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;
      display: block;
      margin-top: 4px;
    }

    .ts-usage-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
      font-size: 11px;
      color: #888;
    }

    .ts-usage-track {
      flex: 1;
      height: 4px;
      background: #eee;
      border-radius: 2px;
      overflow: hidden;
    }

    .ts-usage-fill {
      height: 100%;
      background: #6C47FF;
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    .ts-api-banner {
      background: #fff8e6;
      border: 1.5px solid #ffd86b;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 12px;
      color: #7a5c00;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ts-api-banner a {
      color: #6C47FF;
      text-decoration: none;
      font-weight: 600;
    }

    .ts-api-banner a:hover { text-decoration: underline; }

    @media (prefers-color-scheme: dark) {
      :host { color: #e8e8f0; }

      .ts-panel {
        background: #1e1e2e;
        border-color: rgba(255,255,255,0.1);
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      }

      .ts-select {
        background: #2a2a3e;
        border-color: #3a3a5e;
        color: #e8e8f0;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23aaa' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
      }

      .ts-label { color: #aaa; }

      .ts-result-card {
        background: #252538;
        border-color: #3a3a5e;
        color: #e8e8f0;
      }

      .ts-btn-secondary {
        background: #2a2040;
        color: #a080ff;
      }

      .ts-btn-secondary:hover { background: #352858; }

      .ts-btn-locked {
        background: #2a2a3e;
        color: #666;
      }

      .ts-error {
        background: #2e1a1a;
        border-color: #6b3030;
        color: #ff8080;
      }

      .ts-api-banner {
        background: #2e2612;
        border-color: #7a5c00;
        color: #ffd86b;
      }

      .ts-usage-track { background: #3a3a5e; }
      .ts-upgrade-note { color: #888; }
    }
  `;

  class ToneShiftPanel {
    constructor() {
      this.host = null;
      this.shadow = null;
      this.triggerBtn = null;
      this.panel = null;
      this.currentInputEl = null;
      this.isPanelOpen = false;
      this.lastAction = null;
      this.customTones = [];
      this._boundClose = this._onDocClick.bind(this);
    }

    async init() {
      if (document.getElementById('__tonshift_host__')) return;

      // カスタムトーンを読み込む
      this.customTones = await ToneShiftStorage.getCustomTones();

      // ホスト要素を作成
      this.host = document.createElement('div');
      this.host.id = '__tonshift_host__';
      this.shadow = this.host.attachShadow({ mode: 'closed' });

      // スタイルを注入
      const style = document.createElement('style');
      style.textContent = CSS;
      this.shadow.appendChild(style);

      // トリガーボタン
      this.triggerBtn = document.createElement('button');
      this.triggerBtn.className = 'ts-trigger';
      this.triggerBtn.setAttribute('title', 'ToneShift — AI Writing Assistant');
      this.triggerBtn.innerHTML = '✨';
      this.triggerBtn.style.display = 'none';
      this.triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePanel();
      });
      this.shadow.appendChild(this.triggerBtn);

      // パネル
      this.panel = document.createElement('div');
      this.panel.className = 'ts-panel';
      this.shadow.appendChild(this.panel);

      document.body.appendChild(this.host);
    }

    showTrigger(inputEl) {
      this.currentInputEl = inputEl;
      const rect = inputEl.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      const top = rect.bottom + scrollY - 44;
      const left = rect.right + scrollX - 44;

      this.triggerBtn.style.display = 'flex';
      this.triggerBtn.style.top = `${Math.max(top, 8)}px`;
      this.triggerBtn.style.left = `${Math.min(left, window.innerWidth - 52)}px`;
      this.triggerBtn.style.position = 'absolute';
    }

    hideTrigger() {
      this.triggerBtn.style.display = 'none';
      this.closePanel();
    }

    async togglePanel() {
      if (this.isPanelOpen) {
        this.closePanel();
      } else {
        await this.openPanel();
      }
    }

    async openPanel() {
      this.isPanelOpen = true;

      const [apiKey, isPro, usageCount, defaultTone] = await Promise.all([
        ToneShiftStorage.getApiKey(),
        ToneShiftStorage.getIsPro(),
        ToneShiftStorage.getUsageToday(),
        ToneShiftStorage.getDefaultTone()
      ]);

      const allTones = [...TONES, ...this.customTones.map(t => t.name)];

      this.panel.innerHTML = `
        <div class="ts-header">
          <div class="ts-header-title">✨ ToneShift</div>
          <button class="ts-close" id="ts-close-btn" title="Close">✕</button>
        </div>
        <div class="ts-body">
          ${!apiKey ? `
            <div class="ts-api-banner">
              ⚠️ API key not set. <a href="#" id="ts-open-options">Open Settings →</a>
            </div>
          ` : ''}

          <div class="ts-label">Tone</div>
          <select class="ts-select" id="ts-tone-select">
            ${allTones.map(t => `<option value="${t}" ${t === defaultTone ? 'selected' : ''}>${t}</option>`).join('')}
          </select>

          <div class="ts-actions">
            <button class="ts-btn ts-btn-primary" id="ts-rewrite-btn" ${!apiKey ? 'disabled' : ''}>
              ✏️ Rewrite in this tone
            </button>
            ${isPro ? `
              <button class="ts-btn ts-btn-secondary" id="ts-replies-btn" ${!apiKey ? 'disabled' : ''}>
                💬 Generate 3 replies
              </button>
            ` : `
              <button class="ts-btn ts-btn-locked" disabled>
                💬 Generate 3 replies
              </button>
              <div class="ts-upgrade-note">
                Pro only. <span class="ts-upgrade-link" id="ts-upgrade-link">✨ Upgrade to Pro</span>
              </div>
            `}
          </div>

          ${!isPro ? `
            <div class="ts-usage-bar">
              <span>${usageCount}/${FREE_DAILY_LIMIT} today</span>
              <div class="ts-usage-track">
                <div class="ts-usage-fill" style="width:${Math.min(100, (usageCount / FREE_DAILY_LIMIT) * 100)}%"></div>
              </div>
            </div>
          ` : ''}

          <div id="ts-results-area"></div>
        </div>
      `;

      // イベントリスナーを設定（ShadowRootにはgetElementByIdがないのでquerySelectorを使用）
      const closeBtn = this.shadow.querySelector('#ts-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', () => this.closePanel());

      const openOptions = this.shadow.querySelector('#ts-open-options');
      if (openOptions) {
        openOptions.addEventListener('click', (e) => {
          e.preventDefault();
          chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
        });
      }

      const rewriteBtn = this.shadow.querySelector('#ts-rewrite-btn');
      if (rewriteBtn) {
        rewriteBtn.addEventListener('click', () => this._handleRewrite());
      }

      const repliesBtn = this.shadow.querySelector('#ts-replies-btn');
      if (repliesBtn) {
        repliesBtn.addEventListener('click', () => this._handleReplies());
      }

      const upgradeLink = this.shadow.querySelector('#ts-upgrade-link');
      if (upgradeLink) {
        upgradeLink.addEventListener('click', () => {
          chrome.runtime.sendMessage({ type: 'OPEN_PAYMENT' });
        });
      }

      // パネル位置を設定
      this._positionPanel();

      // アニメーション
      requestAnimationFrame(() => {
        this.panel.classList.add('ts-open');
      });

      // 外側クリックで閉じる
      setTimeout(() => {
        document.addEventListener('click', this._boundClose);
      }, 100);
    }

    _positionPanel() {
      const triggerRect = this.triggerBtn.getBoundingClientRect();
      const panelWidth = 320;
      const margin = 8;

      let left = triggerRect.right - panelWidth;
      let top = triggerRect.bottom + margin;

      // 画面外に出ないよう調整
      if (left < margin) left = margin;
      if (left + panelWidth > window.innerWidth - margin) {
        left = window.innerWidth - panelWidth - margin;
      }
      if (top + 400 > window.innerHeight) {
        top = triggerRect.top - 400 - margin;
      }

      this.panel.style.position = 'fixed';
      this.panel.style.left = `${left}px`;
      this.panel.style.top = `${top}px`;
    }

    closePanel() {
      this.isPanelOpen = false;
      this.panel.classList.remove('ts-open');
      document.removeEventListener('click', this._boundClose);
    }

    _onDocClick(e) {
      // closed Shadow DOM では e.target がホスト要素になるので
      // composedPath() でクリックパスがホスト内を通っているか確認する
      const path = e.composedPath ? e.composedPath() : [];
      if (!path.includes(this.host)) {
        this.closePanel();
      }
    }

    _getTone() {
      const sel = this.shadow.querySelector('#ts-tone-select');
      return sel ? sel.value : 'Professional';
    }

    async _handleRewrite() {
      const inputText = ToneShiftContext.getInputText(this.currentInputEl);
      if (!inputText || inputText.length < 5) {
        this._showError('Please enter some text first.');
        return;
      }

      const isPro = await ToneShiftStorage.getIsPro();
      if (!isPro) {
        const usage = await ToneShiftStorage.getUsageToday();
        if (usage >= FREE_DAILY_LIMIT) {
          this._showError(`Daily limit reached (${FREE_DAILY_LIMIT}/day). <span class="ts-upgrade-link" id="ts-limit-upgrade">Upgrade to Pro</span> for unlimited use.`);
          setTimeout(() => {
            const link = this.shadow.querySelector('#ts-limit-upgrade');
            if (link) link.addEventListener('click', () => chrome.runtime.sendMessage({ type: 'OPEN_PAYMENT' }));
          }, 50);
          return;
        }
      }

      const apiKey = await ToneShiftStorage.getApiKey();
      if (!apiKey) {
        this._showError('API key not set. <a href="#" id="ts-err-settings">Open Settings</a>');
        setTimeout(() => {
          const link = this.shadow.querySelector('#ts-err-settings');
          if (link) link.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
          });
        }, 50);
        return;
      }

      const tone = this._getTone();
      const context = ToneShiftContext.getPageContext();
      this.lastAction = { type: 'rewrite', inputText, tone, context };

      this._showLoading('Rewriting...');

      try {
        const result = await ClaudeAPI.rewriteText(apiKey, inputText, tone, context);
        if (!isPro) await ToneShiftStorage.incrementUsage();
        this._showResults([result]);
      } catch (err) {
        this._showError(ClaudeAPI.formatError(err), true);
      }
    }

    async _handleReplies() {
      const context = ToneShiftContext.getPageContext();
      const inputText = ToneShiftContext.getInputText(this.currentInputEl);
      const fullContext = context || inputText;

      if (!fullContext || fullContext.length < 5) {
        this._showError('No context found to generate replies. Make sure you are replying to a message.');
        return;
      }

      const apiKey = await ToneShiftStorage.getApiKey();
      if (!apiKey) {
        this._showError('API key not set. Open Settings to add your key.');
        return;
      }

      const tone = this._getTone();
      this.lastAction = { type: 'replies', context: fullContext, tone };

      this._showLoading('Generating replies...');

      try {
        const replies = await ClaudeAPI.generateReplies(apiKey, fullContext, tone);
        this._showResults(replies);
      } catch (err) {
        this._showError(ClaudeAPI.formatError(err), true);
      }
    }

    _showLoading(message) {
      const area = this.shadow.querySelector('#ts-results-area');
      if (!area) return;
      area.innerHTML = `
        <div class="ts-loading">
          <span class="ts-spinner"></span>${message}
        </div>
      `;
    }

    _showError(message, showRetry = false) {
      const area = this.shadow.querySelector('#ts-results-area');
      if (!area) return;
      area.innerHTML = `
        <div class="ts-error">
          <span>⚠️</span>
          <div>
            ${message}
            ${showRetry && this.lastAction ? '<button class="ts-error-retry" id="ts-retry-btn">Retry</button>' : ''}
          </div>
        </div>
      `;
      if (showRetry && this.lastAction) {
        const retryBtn = this.shadow.querySelector('#ts-retry-btn');
        if (retryBtn) {
          retryBtn.addEventListener('click', () => {
            if (this.lastAction.type === 'rewrite') this._handleRewrite();
            else this._handleReplies();
          });
        }
      }
    }

    _showResults(texts) {
      const area = this.shadow.querySelector('#ts-results-area');
      if (!area) return;

      const cards = texts.map((text, i) => `
        <div class="ts-result-card">
          <p>${this._escapeHtml(text)}</p>
          <button class="ts-use-btn" data-index="${i}">Use this ↗</button>
        </div>
      `).join('');

      area.innerHTML = `<div class="ts-results">${cards}</div>`;

      area.querySelectorAll('.ts-use-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index, 10);
          const targetEl = this.currentInputEl;
          ToneShiftContext.setInputText(targetEl, texts[index]);
          this.closePanel();
          // closePanel後にフォーカスとカーソル位置を復元
          // （これがないとコピー/カットが効かない）
          requestAnimationFrame(() => {
            if (!targetEl) return;
            targetEl.focus();
            try {
              const sel = window.getSelection();
              const range = document.createRange();
              range.selectNodeContents(targetEl);
              range.collapse(false); // カーソルを末尾へ
              sel.removeAllRanges();
              sel.addRange(range);
            } catch {}
          });
        });
      });
    }

    _escapeHtml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    destroy() {
      document.removeEventListener('click', this._boundClose);
      if (this.host && this.host.parentNode) {
        this.host.parentNode.removeChild(this.host);
      }
    }
  }

  let instance = null;

  function getInstance() {
    if (!instance) instance = new ToneShiftPanel();
    return instance;
  }

  return { getInstance, ToneShiftPanel };
})();
