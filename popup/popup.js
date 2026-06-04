const FREE_DAILY_LIMIT = 10;

async function init() {
  const [apiKey, isPro, usageCount, extensionEnabled, siteEnabled] = await Promise.all([
    ToneShiftStorage.getApiKey(),
    ToneShiftStorage.getIsPro(),
    ToneShiftStorage.getUsageToday(),
    ToneShiftStorage.getExtensionEnabled(),
    ToneShiftStorage.get(['siteEnabled'])
  ]);

  const sites = siteEnabled.siteEnabled || {
    'mail.google.com': true,
    'www.linkedin.com': true,
    'twitter.com': true,
    'x.com': true
  };

  // APIキー状態
  const apiKeyBadge = document.getElementById('api-key-badge');
  if (apiKey) {
    apiKeyBadge.textContent = 'Set ✓';
    apiKeyBadge.className = 'badge badge-ok';
  } else {
    apiKeyBadge.textContent = 'Not set';
    apiKeyBadge.className = 'badge badge-error';
  }

  // Proバッジ
  const planBadge = document.getElementById('plan-badge');
  if (isPro) {
    planBadge.textContent = '✨ Pro';
    planBadge.className = 'badge badge-pro';
    document.getElementById('usage-section').style.display = 'none';
    document.getElementById('upgrade-section').style.display = 'none';
  } else {
    planBadge.textContent = 'Free';
    planBadge.className = 'badge badge-free';
    document.getElementById('upgrade-section').style.display = 'block';
    updateUsageBar(usageCount);
  }

  // 拡張機能トグル
  const extToggle = document.getElementById('extension-toggle');
  extToggle.checked = extensionEnabled;
  extToggle.addEventListener('change', async () => {
    await ToneShiftStorage.set({ extensionEnabled: extToggle.checked });
  });

  // サイトごとのトグル
  document.querySelectorAll('.site-toggle').forEach((toggle) => {
    const site = toggle.dataset.site;
    toggle.checked = sites[site] !== false;
    toggle.addEventListener('change', async () => {
      const current = (await ToneShiftStorage.get(['siteEnabled'])).siteEnabled || {};
      current[site] = toggle.checked;
      // x.comとtwitter.comは連動
      if (site === 'twitter.com') current['x.com'] = toggle.checked;
      if (site === 'x.com') current['twitter.com'] = toggle.checked;
      await ToneShiftStorage.set({ siteEnabled: current });
    });
  });

  // Upgradeボタン
  const upgradeBtn = document.getElementById('upgrade-btn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
      // Lemon Squeezy 商品登録後に TONSHIFT_VARIANT_ID を実際のVariant IDに置き換える
      chrome.tabs.create({
        url: 'https://saitoomasaki.lemonsqueezy.com/checkout/buy/2f6974e6-42dc-4e21-905e-8769258a55b7'
      });
    });
  }

  // Settingsボタン
  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Pro状態を最新化（バックグラウンドで）
  chrome.runtime.sendMessage({ type: 'SYNC_PRO' });
}

function updateUsageBar(count) {
  const countEl = document.getElementById('usage-count');
  const fillEl = document.getElementById('usage-fill');
  if (!countEl || !fillEl) return;

  countEl.textContent = `${count} / ${FREE_DAILY_LIMIT}`;
  const pct = Math.min(100, (count / FREE_DAILY_LIMIT) * 100);
  fillEl.style.width = `${pct}%`;

  if (pct >= 100) {
    fillEl.style.background = '#e53e3e';
  } else if (pct >= 70) {
    fillEl.style.background = 'linear-gradient(90deg, #6C47FF, #f6ad55)';
  }
}

document.addEventListener('DOMContentLoaded', init);
