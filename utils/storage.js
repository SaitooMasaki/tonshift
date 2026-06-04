// chrome.storage wrapper
const ToneShiftStorage = (() => {
  function get(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    });
  }

  function set(items) {
    return new Promise((resolve) => {
      chrome.storage.local.set(items, resolve);
    });
  }

  async function getApiKey() {
    const result = await get(['apiKey']);
    return result.apiKey || '';
  }

  async function saveApiKey(key) {
    await set({ apiKey: key });
  }

  async function getLicenseKey() {
    const result = await get(['licenseKey']);
    return result.licenseKey || '';
  }

  async function saveLicenseKey(key) {
    await set({ licenseKey: key });
  }

  async function getIsPro() {
    const result = await get(['isPro']);
    return result.isPro || false;
  }

  async function getDefaultTone() {
    const result = await get(['defaultTone']);
    return result.defaultTone || 'Professional';
  }

  async function getExtensionEnabled() {
    const result = await get(['extensionEnabled']);
    return result.extensionEnabled !== false;
  }

  async function getSiteEnabled(hostname) {
    const result = await get(['siteEnabled']);
    const siteEnabled = result.siteEnabled || {};
    return siteEnabled[hostname] !== false;
  }

  async function getCustomTones() {
    const result = await get(['customTones']);
    return result.customTones || [];
  }

  // 使用回数の管理（日付付き）
  async function getUsageToday() {
    const result = await get(['usageData']);
    const today = new Date().toISOString().slice(0, 10);
    const usage = result.usageData || {};
    if (usage.date !== today) {
      return 0;
    }
    return usage.count || 0;
  }

  async function incrementUsage() {
    const result = await get(['usageData']);
    const today = new Date().toISOString().slice(0, 10);
    const usage = result.usageData || {};
    const newCount = usage.date === today ? (usage.count || 0) + 1 : 1;
    await set({ usageData: { date: today, count: newCount } });
    return newCount;
  }

  async function resetUsage() {
    await set({ usageData: { date: new Date().toISOString().slice(0, 10), count: 0 } });
  }

  return {
    get,
    set,
    getApiKey,
    saveApiKey,
    getLicenseKey,
    saveLicenseKey,
    getIsPro,
    getDefaultTone,
    getExtensionEnabled,
    getSiteEnabled,
    getCustomTones,
    getUsageToday,
    incrementUsage,
    resetUsage
  };
})();
