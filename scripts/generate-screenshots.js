'use strict';

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, '../store/screenshots');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const MOCK_PAGE = `file://${path.join(__dirname, '../store/screenshot-mock.html').replace(/\\/g, '/')}`;
const OPTIONS_PAGE = `file://${path.join(__dirname, '../options/options.html').replace(/\\/g, '/')}`;

async function shoot(page, filename, setup) {
  await setup();
  await new Promise(r => setTimeout(r, 300));
  const file = path.join(OUT_DIR, filename);
  await page.screenshot({ path: file, type: 'png' });
  const kb = (fs.statSync(file).size / 1024).toFixed(0);
  console.log(`  ✅ ${filename} (${kb} KB)`);
}

async function run() {
  console.log('\n📸 ToneShift Screenshot Generator\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  // ─── スクリーンショット用CSSを挿入する関数 ───
  async function injectFonts(page) {
    await page.addStyleTag({
      content: `* { -webkit-font-smoothing: antialiased; }`
    });
  }

  // 共通: パネルとトリガーを fixed 配置でビューポート基準に移動
  async function fixPanelPosition(page) {
    await page.evaluate(() => {
      const panel = document.querySelector('.ts-panel');
      if (panel) {
        panel.style.position = 'fixed';
        panel.style.top = '60px';
        panel.style.left = '600px';
        panel.style.right = 'auto';
        panel.style.display = 'block';
      }
      const trigger = document.querySelector('.ts-trigger');
      if (trigger) {
        trigger.style.position = 'fixed';
        trigger.style.top = '170px';
        trigger.style.left = '888px';
        trigger.style.right = 'auto';
        trigger.style.bottom = 'auto';
        trigger.style.display = 'flex';
      }
    });
  }

  // ─── Scene 1: ✨ボタンが出た状態 ───
  {
    const page = await browser.newPage();
    await page.goto(MOCK_PAGE, { waitUntil: 'networkidle0' });
    await injectFonts(page);

    await shoot(page, '01-trigger-button.png', async () => {
      await page.evaluate(() => {
        document.querySelector('.ts-panel').style.display = 'none';
        document.querySelector('.ts-trigger').style.display = 'flex';
      });
      await fixPanelPosition(page);
    });
    await page.close();
  }

  // ─── Scene 2: パネル展開（トーン選択） ───
  {
    const page = await browser.newPage();
    await page.goto(MOCK_PAGE, { waitUntil: 'networkidle0' });
    await injectFonts(page);

    await shoot(page, '02-panel-open.png', async () => {
      await page.evaluate(() => {
        document.querySelector('.ts-result-card').style.display = 'none';
        document.querySelector('.ts-usage-bar').style.display = 'none';
      });
      await fixPanelPosition(page);
    });
    await page.close();
  }

  // ─── Scene 3: リライト結果が表示された状態 ───
  {
    const page = await browser.newPage();
    await page.goto(MOCK_PAGE, { waitUntil: 'networkidle0' });
    await injectFonts(page);

    await shoot(page, '03-rewrite-result.png', async () => {
      await fixPanelPosition(page);
    });
    await page.close();
  }

  // ─── Scene 4: 日本語対応アピール ───
  {
    const page = await browser.newPage();
    await page.goto(MOCK_PAGE, { waitUntil: 'networkidle0' });
    await injectFonts(page);

    await shoot(page, '04-multilingual.png', async () => {
      await page.evaluate(() => {
        document.querySelector('.ts-result-text').textContent =
          '先日のミーティングの内容について、チームの皆様にご共有申し上げたく存じます。新機能のリリース日程と優先事項を整理いたしました。';
        document.querySelector('.ts-select').value = 'Professional';
        document.querySelector('.x-compose-input').textContent =
          '先日のミーティングで話した内容をチームに共有したい。新機能のリリース日程と優先事項を整理した。';
      });
      await fixPanelPosition(page);
    });
    await page.close();
  }

  // ─── Scene 5: Settingsページ（APIキー設定済み状態） ───
  {
    const page = await browser.newPage();
    await page.goto(OPTIONS_PAGE, { waitUntil: 'networkidle0' });
    await injectFonts(page);

    await shoot(page, '05-settings.png', async () => {
      // APIキー設定済み・Pro未設定の状態を表示
      await page.evaluate(() => {
        // API key maskedを表示
        const masked = document.getElementById('api-key-masked');
        if (masked) {
          masked.style.display = 'block';
          masked.textContent = 'sk-ant-••••••••••••••••••••';
        }
        const input = document.getElementById('api-key-input');
        if (input) input.style.display = 'none';
        const clearBtn = document.getElementById('clear-api-key');
        if (clearBtn) clearBtn.style.display = 'inline-flex';
        const saveBtn = document.getElementById('save-api-key');
        if (saveBtn) saveBtn.textContent = 'Update Key';

        // Site togglesをONに
        document.querySelectorAll('.site-checkbox').forEach(cb => { cb.checked = true; });

        // スクロールをトップに
        window.scrollTo(0, 0);
      });
    });
    await page.close();
  }

  await browser.close();

  console.log(`\n📁 保存先: store/screenshots/`);
  console.log('   計5枚 → Chrome Web Store にアップロードしてください\n');
}

run().catch(err => {
  console.error('💥 Error:', err.message);
  process.exit(1);
});
