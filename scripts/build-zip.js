'use strict';

/**
 * Chrome Web Store 提出用 ZIP を生成する
 * 使い方: node scripts/build-zip.js
 * 出力:  tonshift-v{version}.zip
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
const version = manifest.version;
const outFile = path.join(ROOT, `tonshift-v${version}.zip`);

// ZIPに含めるファイル/フォルダ
const INCLUDE = [
  'manifest.json',
  'background.js',
  'ExtPay.js',
  'content/',
  'api/',
  'utils/',
  'popup/',
  'options/',
  'assets/icons/',
  '_locales/',
];

// 存在チェック
const missing = INCLUDE.filter(f => {
  const full = path.join(ROOT, f);
  return !fs.existsSync(full);
});

if (missing.length > 0) {
  console.error('❌ 以下のファイルが見つかりません:');
  missing.forEach(f => console.error('  -', f));
  if (missing.includes('ExtPay.js')) {
    console.error('\n  ExtPay.js を dist/ExtPay.js からダウンロードして配置してください');
    console.error('  https://github.com/Glench/ExtPay/blob/main/dist/ExtPay.js');
  }
  process.exit(1);
}

// 既存ZIPを削除
if (fs.existsSync(outFile)) fs.unlinkSync(outFile);

// PowerShell の Compress-Archive で ZIP 生成
const includeArgs = INCLUDE.map(f => `"${path.join(ROOT, f)}"`).join(',');

try {
  // Windows: PowerShell
  const items = INCLUDE.map(f => path.join(ROOT, f));
  const itemsArg = items.map(p => `'${p}'`).join(',');
  execSync(
    `powershell -Command "Compress-Archive -Path ${itemsArg} -DestinationPath '${outFile}'"`,
    { stdio: 'inherit' }
  );
} catch {
  // フォールバック: 手動でコピーしてZIP
  console.error('PowerShell ZIP失敗。手動でフォルダをZIPしてください。');
  process.exit(1);
}

const size = (fs.statSync(outFile).size / 1024).toFixed(1);
console.log(`\n✅ 生成完了: tonshift-v${version}.zip (${size} KB)`);
console.log('   Chrome Web Store にこのZIPをアップロードしてください。\n');
