// Lemon Squeezy License Key 検証
const LemonSqueezy = (() => {
  // LS で ToneShift Pro 商品を作成後に設定する
  // CLAUDE.md の「Lemon Squeezy アカウント情報」を参照
  const LS_PRODUCT_ID = 1115785;
  const VALIDATE_URL = 'https://api.lemonsqueezy.com/v1/licenses/validate';

  async function validateLicenseKey(licenseKey) {
    if (!licenseKey || !licenseKey.trim()) {
      return { valid: false, error: 'No license key provided.' };
    }

    try {
      const response = await fetch(VALIDATE_URL, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: licenseKey.trim() })
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        return { valid: false, error: 'Invalid license key.' };
      }

      // 商品IDチェック（設定済みの場合のみ）
      if (LS_PRODUCT_ID && data.meta?.product_id !== LS_PRODUCT_ID) {
        return { valid: false, error: 'This key is not for ToneShift Pro.' };
      }

      return {
        valid: true,
        customerEmail: data.meta?.customer_email || '',
        productName: data.meta?.product_name || 'ToneShift Pro'
      };
    } catch {
      return { valid: false, error: 'Network error. Please check your connection.' };
    }
  }

  return { validateLicenseKey };
})();
