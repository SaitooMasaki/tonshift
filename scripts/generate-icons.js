'use strict';

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, '../assets/icons');

function svgIcon(size) {
  const r = Math.round(size * 0.18);
  // ペン+スパークルのSVGパス（128px基準でscale）
  const sc = size / 128;

  // ペン本体（中央左寄り、45度回転）
  // スパークル（右上）
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6C47FF"/>
      <stop offset="100%" stop-color="#A87CFF"/>
    </linearGradient>
  </defs>

  <!-- 角丸背景 -->
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)"/>

  <!-- ペン（回転） -->
  <g transform="translate(${size*0.44},${size*0.5}) rotate(-45)">
    <!-- ボディ -->
    <rect x="${-9*sc}" y="${-18*sc}" width="${18*sc}" height="${24*sc}" rx="${3*sc}" fill="white"/>
    <!-- ペン先 -->
    <polygon points="${-9*sc},${7*sc} ${9*sc},${7*sc} 0,${20*sc}" fill="white"/>
    <!-- ペン後端 -->
    <rect x="${-9*sc}" y="${-22*sc}" width="${18*sc}" height="${6*sc}" rx="${2*sc}" fill="rgba(255,255,255,0.6)"/>
  </g>

  <!-- スパークル ✦ -->
  <g transform="translate(${size*0.74},${size*0.26})">
    <path d="
      M 0,${-11*sc}
      L ${3*sc},${-3*sc}
      L ${11*sc},0
      L ${3*sc},${3*sc}
      L 0,${11*sc}
      L ${-3*sc},${3*sc}
      L ${-11*sc},0
      L ${-3*sc},${-3*sc}
      Z
    " fill="white"/>
  </g>

  <!-- 小さいスパークル -->
  <g transform="translate(${size*0.3},${size*0.28})">
    <path d="
      M 0,${-5*sc}
      L ${1.5*sc},${-1.5*sc}
      L ${5*sc},0
      L ${1.5*sc},${1.5*sc}
      L 0,${5*sc}
      L ${-1.5*sc},${1.5*sc}
      L ${-5*sc},0
      L ${-1.5*sc},${-1.5*sc}
      Z
    " fill="rgba(255,255,255,0.7)"/>
  </g>
</svg>`;
}

async function run() {
  console.log('\n🎨 ToneShift Icon Generator\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const sizes = [16, 32, 48, 128];

  for (const size of sizes) {
    const page = await browser.newPage();
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 2 });

    const svg = svgIcon(size);
    const html = `<!DOCTYPE html>
<html>
<head>
<style>
* { margin:0; padding:0; }
body { width:${size}px; height:${size}px; overflow:hidden; background:transparent; }
</style>
</head>
<body>${svg}</body>
</html>`;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 150));

    const outPath = path.join(OUT_DIR, `icon${size}.png`);
    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: size, height: size },
      omitBackground: false
    });

    await page.close();

    const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`  ✅ icon${size}.png (${kb} KB)`);
  }

  await browser.close();
  console.log('\n📁 保存先: assets/icons/\n');
}

run().catch(err => {
  console.error('💥', err.message);
  process.exit(1);
});
