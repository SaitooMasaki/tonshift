'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
const version = manifest.version;
const outFile = path.join(ROOT, `tonshift-v${version}.zip`);

// ZIPに含めるパス（tonshift/ルートからの相対パス）
const INCLUDE = [
  'manifest.json',
  'background.js',
  'ExtPay.js',
  'content',
  'api',
  'utils',
  'popup',
  'options',
  'assets',
  '_locales',
];

// ExtPay.js の存在チェック
const extpayPath = path.join(ROOT, 'ExtPay.js');
if (!fs.existsSync(extpayPath)) {
  console.error('❌ ExtPay.js が見つかりません。');
  console.error('   https://github.com/Glench/ExtPay/blob/main/dist/ExtPay.js を');
  console.error('   tonshift/ ディレクトリに ExtPay.js として保存してください。');
  process.exit(1);
}

// 既存ZIPを削除
if (fs.existsSync(outFile)) fs.unlinkSync(outFile);

// PowerShell: カレントディレクトリを tonshift/ にしてから Compress-Archive
// → 相対パスが保持される
const paths = INCLUDE.map(p => `'${p}'`).join(',');
const cmd = `powershell -Command "Set-Location '${ROOT}'; Compress-Archive -Path @(${paths}) -DestinationPath '${outFile}' -Force"`;

try {
  execSync(cmd, { stdio: 'inherit' });
} catch (e) {
  console.error('💥 ZIP生成に失敗しました:', e.message);
  process.exit(1);
}

if (!fs.existsSync(outFile)) {
  console.error('💥 ZIPファイルが生成されませんでした。');
  process.exit(1);
}

const size = (fs.statSync(outFile).size / 1024).toFixed(1);
console.log(`\n✅ 生成完了: tonshift-v${version}.zip (${size} KB)`);
console.log('   Chrome Web Store にこのZIPをアップロードしてください。\n');

// 内容確認
try {
  const list = execSync(
    `powershell -Command "Add-Type -Assembly System.IO.Compression.FileSystem; [IO.Compression.ZipFile]::OpenRead('${outFile}').Entries | Select-Object -ExpandProperty FullName"`,
    { encoding: 'utf8' }
  );
  const files = list.trim().split('\n').map(f => f.trim()).filter(Boolean);
  const iconFiles = files.filter(f => f.includes('icons'));
  console.log(`📦 アイコンファイル確認:`);
  iconFiles.length > 0
    ? iconFiles.forEach(f => console.log('   ✅', f))
    : console.log('   ❌ アイコンが見つかりません！');
  console.log(`\n   合計 ${files.length} ファイル`);
} catch {
  console.log('   (内容確認をスキップ)');
}
