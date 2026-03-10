#!/usr/bin/env node
/**
 * Converts Lucide SVG icons to PNG at Android density resolutions.
 * Output: App_Resources/Android/src/main/res/drawable-{density}/
 *
 * Usage: node scripts/generate-tab-icons.js
 */

const fs = require('fs');
const path = require('path');

/* Design tokens: muted-foreground (#71717a), primary/foreground (#18181b) */
const ICONS = [
  { lucide: 'home', name: 'ic_tab_home', color: '#71717a' },
  { lucide: 'home', name: 'ic_tab_home_selected', color: '#18181b' },
  { lucide: 'receipt', name: 'ic_tab_receipt', color: '#71717a' },
  { lucide: 'receipt', name: 'ic_tab_receipt_selected', color: '#18181b' },
  { lucide: 'shopping-cart', name: 'ic_tab_cart', color: '#71717a' },
  { lucide: 'shopping-cart', name: 'ic_tab_cart_selected', color: '#18181b' },
];

const DENSITIES = [
  { folder: 'drawable-mdpi', size: 24 },
  { folder: 'drawable-hdpi', size: 36 },
  { folder: 'drawable-xhdpi', size: 48 },
  { folder: 'drawable-xxhdpi', size: 72 },
  { folder: 'drawable-xxxhdpi', size: 96 },
];

const LUCIDE_ICONS = path.join(__dirname, '../node_modules/lucide-static/icons');
const RES_BASE = path.join(__dirname, '../App_Resources/Android/src/main/res');

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('Run: npm install sharp --save-dev');
    process.exit(1);
  }

  for (const { lucide, name, color } of ICONS) {
    const svgPath = path.join(LUCIDE_ICONS, `${lucide}.svg`);
    if (!fs.existsSync(svgPath)) {
      console.error(`Missing: ${svgPath}`);
      continue;
    }

    let svg = fs.readFileSync(svgPath, 'utf8');
    svg = svg.replace(/stroke="currentColor"/g, `stroke="${color}"`);
    svg = svg.replace(/stroke="black"/g, `stroke="${color}"`);
    const svgBuffer = Buffer.from(svg);

    for (const { folder, size } of DENSITIES) {
      const outDir = path.join(RES_BASE, folder);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      const outPath = path.join(outDir, `${name}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outPath);
      console.log(`  ${outPath}`);
    }
    console.log(`Done: ${name}`);
  }
  console.log('All icons generated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
