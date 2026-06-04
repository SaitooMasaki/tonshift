const MAX_CUSTOM_TONES = 5;

async function init() {
  const [apiKey, isPro, defaultTone, usageCount, siteEnabled, customTones] = await Promise.all([
    ToneShiftStorage.getApiKey(),
    ToneShiftStorage.getIsPro(),
    ToneShiftStorage.getDefaultTone(),
    ToneShiftStorage.getUsageToday(),
    ToneShiftStorage.get(['siteEnabled']),
    ToneShiftStorage.getCustomTones()
  ]);

  const sites = siteEnabled.siteEnabled || {
    'mail.google.com': true,
    'www.linkedin.com': true,
    'twitter.com': true,
    'x.com': true
  };

  // Pro badge
  if (isPro) {
    document.getElementById('pro-badge').style.display = 'block';
  }

  setupApiKey(apiKey);
  setupDefaultTone(defaultTone);
  setupSiteToggles(sites);
  setupCustomTones(isPro, customTones);
  setupUsageStats(usageCount, isPro);
}

// APIキーセクション
function setupApiKey(currentKey) {
  const input = document.getElementById('api-key-input');
  const maskedEl = document.getElementById('api-key-masked');
  const saveBtn = document.getElementById('save-api-key');
  const clearBtn = document.getElementById('clear-api-key');
  const toggleBtn = document.getElementById('toggle-key-visibility');
  const feedback = document.getElementById('api-key-feedback');

  if (currentKey) {
    input.style.display = 'none';
    maskedEl.style.display = 'block';
    maskedEl.textContent = currentKey.slice(0, 7) + '••••••••••••••••••••';
    clearBtn.style.display = 'inline-flex';
    saveBtn.textContent = 'Update Key';
  }

  toggleBtn.addEventListener('click', () => {
    if (input.style.display === 'none') {
      input.style.display = 'block';
      input.style.marginBottom = '10px';
      maskedEl.style.display = 'none';
      input.focus();
      toggleBtn.textContent = '🙈';
    } else {
      if (currentKey) {
        input.style.display = 'none';
        maskedEl.style.display = 'block';
        toggleBtn.textContent = '👁';
      }
    }
  });

  saveBtn.addEventListener('click', async () => {
    const key = input.value.trim();
    if (!key) {
      showFeedback(feedback, 'Please enter an API key.', 'error');
      return;
    }
    if (!key.startsWith('sk-ant-')) {
      showFeedback(feedback, 'Invalid key format. Anthropic keys start with "sk-ant-".', 'error');
      return;
    }

    await ToneShiftStorage.saveApiKey(key);
    currentKey = key;

    input.value = '';
    input.style.display = 'none';
    maskedEl.style.display = 'block';
    maskedEl.textContent = key.slice(0, 7) + '••••••••••••••••••••';
    clearBtn.style.display = 'inline-flex';
    saveBtn.textContent = 'Update Key';
    toggleBtn.textContent = '👁';

    showFeedback(feedback, '✓ API key saved successfully.', 'success');
  });

  clearBtn.addEventListener('click', async () => {
    if (!confirm('Remove your API key? ToneShift will stop working until you add a new one.')) return;

    await ToneShiftStorage.saveApiKey('');
    currentKey = '';

    input.value = '';
    input.style.display = 'block';
    maskedEl.style.display = 'none';
    clearBtn.style.display = 'none';
    saveBtn.textContent = 'Save API Key';
    toggleBtn.textContent = '👁';

    showFeedback(feedback, 'API key removed.', 'success');
  });
}

// デフォルトトーン
function setupDefaultTone(currentTone) {
  const select = document.getElementById('default-tone');
  const saveBtn = document.getElementById('save-default-tone');
  const feedback = document.getElementById('tone-feedback');

  select.value = currentTone || 'Professional';

  saveBtn.addEventListener('click', async () => {
    await ToneShiftStorage.set({ defaultTone: select.value });
    showFeedback(feedback, '✓ Default tone saved.', 'success');
  });
}

// サイトトグル
function setupSiteToggles(sites) {
  document.querySelectorAll('.site-checkbox').forEach((checkbox) => {
    const site = checkbox.dataset.site;
    checkbox.checked = sites[site] !== false;

    checkbox.addEventListener('change', async () => {
      const current = (await ToneShiftStorage.get(['siteEnabled'])).siteEnabled || {};
      current[site] = checkbox.checked;
      // twitter.com と x.com を連動
      if (site === 'twitter.com') current['x.com'] = checkbox.checked;
      await ToneShiftStorage.set({ siteEnabled: current });
    });
  });
}

// カスタムトーン（Pro限定）
function setupCustomTones(isPro, customTones) {
  const lockedEl = document.getElementById('custom-tones-locked');
  const addEl = document.getElementById('custom-tones-add');
  const listEl = document.getElementById('custom-tones-list');

  if (isPro) {
    lockedEl.style.display = 'none';
    addEl.style.display = 'block';
    renderCustomTones(customTones, listEl);
  } else {
    lockedEl.style.display = 'flex';
    addEl.style.display = 'none';

    const upgradeBtn = document.getElementById('upgrade-from-tones');
    upgradeBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_PAYMENT' });
    });
  }

  const addBtn = document.getElementById('add-tone-btn');
  if (addBtn) {
    addBtn.addEventListener('click', async () => {
      const name = document.getElementById('custom-tone-name').value.trim();
      const desc = document.getElementById('custom-tone-desc').value.trim();

      if (!name) {
        alert('Please enter a tone name.');
        return;
      }

      const current = await ToneShiftStorage.getCustomTones();
      if (current.length >= MAX_CUSTOM_TONES) {
        alert(`You can add up to ${MAX_CUSTOM_TONES} custom tones.`);
        return;
      }
      if (current.some(t => t.name.toLowerCase() === name.toLowerCase())) {
        alert('A tone with that name already exists.');
        return;
      }

      const updated = [...current, { name, desc }];
      await ToneShiftStorage.set({ customTones: updated });

      document.getElementById('custom-tone-name').value = '';
      document.getElementById('custom-tone-desc').value = '';

      renderCustomTones(updated, listEl);
    });
  }
}

function renderCustomTones(tones, container) {
  container.innerHTML = '';

  if (tones.length === 0) {
    container.innerHTML = '<p style="font-size:12px;color:#999;padding:4px 0">No custom tones yet. Add one below.</p>';
    return;
  }

  tones.forEach((tone, index) => {
    const item = document.createElement('div');
    item.className = 'custom-tone-item';
    item.innerHTML = `
      <div class="custom-tone-info">
        <div class="custom-tone-name">${escapeHtml(tone.name)}</div>
        ${tone.desc ? `<div class="custom-tone-desc">${escapeHtml(tone.desc)}</div>` : ''}
      </div>
      <button class="custom-tone-remove" data-index="${index}" title="Remove">✕</button>
    `;
    container.appendChild(item);
  });

  container.querySelectorAll('.custom-tone-remove').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.index, 10);
      const current = await ToneShiftStorage.getCustomTones();
      const updated = current.filter((_, i) => i !== idx);
      await ToneShiftStorage.set({ customTones: updated });
      renderCustomTones(updated, container);
    });
  });
}

// 使用統計
function setupUsageStats(usageCount, isPro) {
  document.getElementById('stat-today').textContent = usageCount;
  document.getElementById('stat-limit').textContent = isPro ? '∞' : '10';

  const resetBtn = document.getElementById('reset-usage');
  const feedback = document.getElementById('reset-feedback');

  resetBtn.addEventListener('click', async () => {
    if (!confirm('Reset today\'s usage counter?')) return;
    await ToneShiftStorage.resetUsage();
    document.getElementById('stat-today').textContent = '0';
    showFeedback(feedback, '✓ Usage counter reset.', 'success');
  });
}

function showFeedback(el, message, type) {
  el.textContent = message;
  el.className = `feedback ${type}`;
  el.style.display = 'block';
  setTimeout(() => {
    el.style.display = 'none';
  }, 3000);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', init);
