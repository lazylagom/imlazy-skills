#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const CONSTANTS = {
  LARGE_THRESHOLD: 1024,
  MARGIN_LARGE: 64,
  MARGIN_SMALL: 32,
  LOGO_VALUE: 255.0,
  ALPHA_THRESHOLD: 0.002,
  MAX_ALPHA: 0.99
};

async function loadMask(maskPath) {
  const maskBuffer = await sharp(maskPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = maskBuffer;
  const { width, height, channels } = info;

  const alphas = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const pixelOffset = i * channels;
    const r = data[pixelOffset];
    const g = data[pixelOffset + 1];
    const b = data[pixelOffset + 2];
    const maxVal = Math.max(r, Math.max(g, b));
    alphas[i] = maxVal / 255.0;
  }

  return { width, height, alphas };
}

function removeWatermark(imageData, width, height, mask, config) {
  const { forceMode, alphaGain } = config;

  let mode = forceMode;
  if (mode === 'auto') {
    mode = (width > CONSTANTS.LARGE_THRESHOLD && height > CONSTANTS.LARGE_THRESHOLD)
      ? 'large' : 'small';
  }

  const currentMask = mask[mode];
  if (!currentMask) {
    throw new Error(`Mask ${mode} not loaded`);
  }

  const margin = mode === 'large' ? CONSTANTS.MARGIN_LARGE : CONSTANTS.MARGIN_SMALL;

  const posX = width - margin - currentMask.width;
  const posY = height - margin - currentMask.height;

  if (posX < 0 || posY < 0) {
    console.log('Image dimensions too small, skipping processing');
    return imageData;
  }



  const data = imageData;
  const channels = 3;

  for (let my = 0; my < currentMask.height; my++) {
    for (let mx = 0; mx < currentMask.width; mx++) {
      const iy = posY + my;
      const ix = posX + mx;

      if (ix >= width || iy >= height) continue;

      const mIdx = my * currentMask.width + mx;
      let alpha = currentMask.alphas[mIdx] * alphaGain;

      if (alpha < CONSTANTS.ALPHA_THRESHOLD) continue;
      if (alpha > CONSTANTS.MAX_ALPHA) alpha = CONSTANTS.MAX_ALPHA;

      const oneMinusAlpha = 1.0 - alpha;
      const idx = (iy * width + ix) * channels;

      for (let c = 0; c < 3; c++) {
        const currentVal = data[idx + c];
        let original = (currentVal - alpha * CONSTANTS.LOGO_VALUE) / oneMinusAlpha;
        if (original < 0) original = 0;
        if (original > 255) original = 255;
        data[idx + c] = Math.round(original);
      }
    }
  }

  return data;
}

function parseArgs(args) {
  const result = {
    input: null,
    output: null,
    mode: 'auto',
    gain: 1.0
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--output' || arg === '-o') {
      result.output = args[++i];
    } else if (arg === '--mode' || arg === '-m') {
      result.mode = args[++i];
    } else if (arg === '--gain' || arg === '-g') {
      result.gain = parseFloat(args[++i]);
    } else if (!arg.startsWith('-') && !result.input) {
      result.input = arg;
    }
  }

  return result;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Gemini Watermark Remover

Usage:
  node remove-watermark.js <input_image> [options]

Options:
  -o, --output <path>   Output file path (default: input_filename_clean)
  -m, --mode <mode>     Mask mode: auto, small, large (default: auto)
  -g, --gain <value>    Alpha gain value 1.0-3.0 (default: 1.0)
  -h, --help            Show this help

Examples:
  node remove-watermark.js image.png
  node remove-watermark.js image.png -o clean.png -m large
        `);
    process.exit(0);
  }

  const config = parseArgs(args);

  if (!config.input) {
    console.error('Error: Please specify input image path');
    process.exit(1);
  }

  if (!fs.existsSync(config.input)) {
    console.error(`Error: File not found ${config.input}`);
    process.exit(1);
  }

  if (!config.output) {
    const ext = path.extname(config.input);
    const base = path.basename(config.input, ext);
    const dir = path.dirname(config.input);
    config.output = path.join(dir, `${base}_clean${ext}`);
  }



  try {
    const skillDir = path.dirname(__dirname);
    const mask = {
      small: await loadMask(path.join(skillDir, 'assets', 'mask-48.png')),
      large: await loadMask(path.join(skillDir, 'assets', 'mask-96.png'))
    };



    const image = sharp(config.input);
    const metadata = await image.metadata();
    const { width, height } = metadata;



    const rawBuffer = await image.removeAlpha().raw().toBuffer();
    const imageData = new Uint8Array(rawBuffer);

    const processedData = removeWatermark(imageData, width, height, mask, {
      forceMode: config.mode,
      alphaGain: config.gain
    });

    await sharp(Buffer.from(processedData), {
      raw: {
        width,
        height,
        channels: 3
      }
    }).toFile(config.output);

    console.log(`✅ Processing complete: ${config.output}`);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();