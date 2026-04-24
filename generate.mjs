#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { writePsdBuffer } from 'ag-psd';
import { createCanvas } from 'canvas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COLOR_MAP = {
  red: 'red',
  orange: 'orange',
  yellow: 'yellow',
  green: 'green',
  blue: 'blue',
  violet: 'violet',
  gray: 'gray',
  none: 'none',
};

const templateArg = process.argv[2];
if (!templateArg) {
  console.error('Usage: node generate.mjs <template.yaml>');
  console.error('Example: node generate.mjs templates/phase1-minimum.yaml');
  process.exit(1);
}

const templatePath = path.resolve(templateArg);
if (!fs.existsSync(templatePath)) {
  console.error(`Template not found: ${templatePath}`);
  process.exit(1);
}

const config = yaml.load(fs.readFileSync(templatePath, 'utf-8'));

if (!config?.canvas?.width || !config?.canvas?.height) {
  console.error('Invalid template: canvas.width and canvas.height are required.');
  process.exit(1);
}

const { width, height } = config.canvas;

// Reusable 1x1 transparent canvas. ag-psd expects every raster layer to have
// a canvas, so we share one for all empty layers.
const emptyCanvas = createCanvas(1, 1);

function buildNode(item) {
  const color = COLOR_MAP[item.color] ?? 'none';

  if (item.type === 'folder') {
    return {
      name: item.name,
      opened: item.opened ?? true,
      layerColor: color,
      hidden: item.hidden ?? false,
      opacity: item.opacity ?? 1.0,
      children: (item.children || []).map(buildNode).reverse(),
    };
  }

  // Empty transparent layer (1x1 placeholder)
  return {
    name: item.name,
    layerColor: color,
    hidden: item.hidden ?? false,
    opacity: item.opacity ?? 1.0,
    canvas: emptyCanvas,
    top: 0,
    left: 0,
    bottom: 1,
    right: 1,
  };
}

// YAML lists layers top-to-bottom (matching CSP's layer panel).
// PSD expects children[0] to be the bottom, so we reverse at every level.
const children = config.structure.map(buildNode).reverse();

const psd = {
  width,
  height,
  children,
  imageResources: {
    resolutionInfo: {
      horizontalResolution: config.canvas.dpi ?? 350,
      horizontalResolutionUnit: 'PPI',
      widthUnit: 'Inches',
      verticalResolution: config.canvas.dpi ?? 350,
      verticalResolutionUnit: 'PPI',
      heightUnit: 'Inches',
    },
  },
};

// Guide lines
if (Array.isArray(config.guides) && config.guides.length > 0) {
  psd.imageResources.gridAndGuidesInformation = {
    grid: { horizontal: 36, vertical: 36 },
    guides: config.guides.map((g) => ({
      location: g.position,
      direction: g.direction,
    })),
  };
}

// A full-size white canvas as the base composite image (required for PSD export).
const base = createCanvas(width, height);
const ctx = base.getContext('2d');
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, width, height);
psd.canvas = base;

const buffer = writePsdBuffer(psd);

const outputDir = path.resolve(__dirname, 'output');
fs.mkdirSync(outputDir, { recursive: true });
const outputName = config.name
  ? `${config.name}.psd`
  : `${path.basename(templatePath, path.extname(templatePath))}.psd`;
const outputPath = path.join(outputDir, outputName);
fs.writeFileSync(outputPath, buffer);

console.log(`✓ Generated: ${outputPath}`);
console.log(`  Canvas: ${width} × ${height} @ ${config.canvas.dpi ?? 350} DPI`);
console.log(`  Layers: ${countLayers(config.structure)}`);

function countLayers(items) {
  let count = 0;
  for (const item of items) {
    if (item.type === 'folder') {
      count += countLayers(item.children || []);
    } else {
      count += 1;
    }
  }
  return count;
}
